import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePairingCode } from '@/lib/api-key'

const PAIRING_TTL_MS = 10 * 60 * 1000

export async function POST(req: NextRequest) {
  let code = generatePairingCode()
  while (await prisma.pairingRequest.findUnique({ where: { code } })) {
    code = generatePairingCode()
  }

  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS)
  await prisma.pairingRequest.create({ data: { code, status: 'PENDING', expiresAt } })

  // req.nextUrl.origin reflects Next.js's internal address (e.g. localhost:3000)
  // behind the nginx reverse proxy in production, not the public hostname --
  // prefer AUTH_URL (already required for NextAuth) when it's set.
  const origin = process.env.AUTH_URL ?? req.nextUrl.origin
  const approvalUrl = new URL(`/pair?code=${code}`, origin).toString()

  return NextResponse.json({ code, expiresAt, approvalUrl }, { status: 201 })
}

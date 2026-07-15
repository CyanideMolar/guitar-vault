import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey } from '@/lib/api-key'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { code } = body
  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  const pairingRequest = await prisma.pairingRequest.findUnique({ where: { code } })
  if (!pairingRequest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (pairingRequest.status !== 'PENDING' || pairingRequest.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This pairing link is invalid or has expired' }, { status: 400 })
  }

  const userId = session.user.id
  const plaintextKey = generateApiKey()
  const hashedKey = hashApiKey(plaintextKey)

  await prisma.$transaction(async (tx) => {
    const apiKey = await tx.apiKey.create({
      data: { userId, hashedKey, label: 'Musician Dial' },
    })
    await tx.pairingRequest.update({
      where: { code },
      data: { status: 'APPROVED', userId, apiKeyId: apiKey.id, plaintextKey },
    })
  })

  return NextResponse.json({ success: true })
}

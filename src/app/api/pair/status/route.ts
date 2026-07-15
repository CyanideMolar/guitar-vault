import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  const pairingRequest = await prisma.pairingRequest.findUnique({ where: { code } })
  if (!pairingRequest || pairingRequest.expiresAt < new Date()) {
    return NextResponse.json({ status: 'expired' })
  }

  if (pairingRequest.status !== 'APPROVED') {
    return NextResponse.json({ status: 'pending' })
  }

  return NextResponse.json({ status: 'approved', apiKey: pairingRequest.plaintextKey })
}

export async function DELETE(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  await prisma.pairingRequest.deleteMany({ where: { code } })
  return NextResponse.json({ success: true })
}

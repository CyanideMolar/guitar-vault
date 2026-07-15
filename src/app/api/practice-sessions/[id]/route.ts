import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const practiceSession = await prisma.practiceSession.findFirst({
    where: { id, userId: session.user.id },
    include: {
      segments: {
        include: { guitar: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!practiceSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(practiceSession)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.practiceSession.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.practiceSession.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

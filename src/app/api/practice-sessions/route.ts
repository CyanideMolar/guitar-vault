import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessions = await prisma.practiceSession.findMany({
    where: { userId: session.user.id },
    include: {
      segments: {
        include: { guitar: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { guitarId, durationSeconds, rating } = body

  if (!guitarId) {
    return NextResponse.json({ error: 'Guitar is required' }, { status: 400 })
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
    return NextResponse.json({ error: 'Duration must be a positive number of seconds' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be an integer from 1 to 5' }, { status: 400 })
  }

  const guitar = await prisma.guitar.findFirst({ where: { id: guitarId, ownerId: session.user.id } })
  if (!guitar) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const practiceSession = await prisma.practiceSession.create({
    data: {
      userId: session.user.id,
      totalDurationSeconds: durationSeconds,
      rating,
      segments: {
        create: [{ guitarId, durationSeconds, order: 0 }],
      },
    },
    include: {
      segments: {
        include: { guitar: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  return NextResponse.json(practiceSession, { status: 201 })
}

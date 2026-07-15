import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/device-auth'

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
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
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { segments, rating } = body

  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json({ error: 'At least one guitar segment is required' }, { status: 400 })
  }
  for (const segment of segments) {
    if (!segment.guitarId) {
      return NextResponse.json({ error: 'Guitar is required for every segment' }, { status: 400 })
    }
    if (!Number.isInteger(segment.durationSeconds) || segment.durationSeconds <= 0) {
      return NextResponse.json({ error: 'Duration must be a positive number of seconds' }, { status: 400 })
    }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be an integer from 1 to 5' }, { status: 400 })
  }

  const guitarIds: string[] = segments.map((s) => s.guitarId)
  const ownedGuitars = await prisma.guitar.findMany({ where: { id: { in: guitarIds }, ownerId: userId } })
  if (ownedGuitars.length !== new Set(guitarIds).size) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const totalDurationSeconds = segments.reduce((sum: number, s) => sum + s.durationSeconds, 0)

  const practiceSession = await prisma.practiceSession.create({
    data: {
      userId,
      totalDurationSeconds,
      rating,
      segments: {
        create: segments.map((s, order: number) => ({ guitarId: s.guitarId, durationSeconds: s.durationSeconds, order })),
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

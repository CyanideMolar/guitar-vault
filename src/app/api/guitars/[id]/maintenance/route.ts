import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const guitar = await prisma.guitar.findFirst({ where: { id, ownerId: session.user.id } })
  if (!guitar) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const records = await prisma.maintenanceRecord.findMany({
    where: { guitarId: id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(records)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const guitar = await prisma.guitar.findFirst({ where: { id, ownerId: session.user.id } })
  if (!guitar) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { taskType, date, notes, cost, performedBy } = body

  if (!taskType) {
    return NextResponse.json({ error: 'Task type is required' }, { status: 400 })
  }

  const record = await prisma.maintenanceRecord.create({
    data: {
      guitarId: id,
      userId: session.user.id,
      taskType,
      date: date ? new Date(date) : new Date(),
      notes,
      cost: cost ? parseFloat(cost) : null,
      performedBy,
    },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json(record, { status: 201 })
}

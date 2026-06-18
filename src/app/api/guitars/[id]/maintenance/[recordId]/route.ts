import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string; recordId: string }> }

async function getRecordForUser(recordId: string, guitarId: string, userId: string) {
  return prisma.maintenanceRecord.findFirst({
    where: { id: recordId, guitarId, guitar: { ownerId: userId } },
  })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, recordId } = await params
  const existing = await getRecordForUser(recordId, id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { taskType, date, notes, cost, performedBy } = await req.json()
  if (!taskType) return NextResponse.json({ error: 'Task type is required' }, { status: 400 })

  const record = await prisma.maintenanceRecord.update({
    where: { id: recordId },
    data: {
      taskType,
      date: date ? new Date(date) : existing.date,
      notes,
      cost: cost ? parseFloat(cost) : null,
      performedBy,
    },
  })

  return NextResponse.json(record)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, recordId } = await params
  const existing = await getRecordForUser(recordId, id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.maintenanceRecord.delete({ where: { id: recordId } })
  return NextResponse.json({ success: true })
}

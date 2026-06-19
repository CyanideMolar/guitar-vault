import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getGuitarForUser(id: string, userId: string) {
  return prisma.guitar.findFirst({ where: { id, ownerId: userId } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const guitar = await prisma.guitar.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      maintenanceRecords: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!guitar) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(guitar)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await getGuitarForUser(id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, brand, model, serialNumber, bridgePickup, neckPickup, middlePickup, preferredTuning, preferredStringGauge, imageUrl, notes } = body

  const guitar = await prisma.guitar.update({
    where: { id },
    data: { name, brand, model, serialNumber, bridgePickup, neckPickup, middlePickup, preferredTuning, preferredStringGauge, imageUrl, notes },
  })

  return NextResponse.json(guitar)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await getGuitarForUser(id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.guitar.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

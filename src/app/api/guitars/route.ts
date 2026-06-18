import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const guitars = await prisma.guitar.findMany({
    where: { ownerId: session.user.id },
    include: {
      customFieldValues: { include: { customField: true } },
      _count: { select: { maintenanceRecords: true } },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(guitars)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, brand, model, serialNumber, bridgePickup, neckPickup, middlePickup, preferredTuning, preferredStringGauge, imageUrl, notes, customFields } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const minOrder = await prisma.guitar.aggregate({
    where: { ownerId: session.user.id },
    _min: { sortOrder: true },
  })
  const sortOrder = minOrder._min.sortOrder != null ? minOrder._min.sortOrder - 1 : 0

  const guitar = await prisma.guitar.create({
    data: {
      name,
      brand,
      model,
      serialNumber,
      bridgePickup,
      neckPickup,
      middlePickup,
      preferredTuning,
      preferredStringGauge,
      imageUrl,
      notes,
      sortOrder,
      ownerId: session.user.id,
      customFieldValues: customFields
        ? {
            create: Object.entries(customFields as Record<string, string>)
              .filter(([, value]) => value !== '')
              .map(([customFieldId, value]) => ({ customFieldId, value })),
          }
        : undefined,
    },
    include: { customFieldValues: { include: { customField: true } } },
  })

  return NextResponse.json(guitar, { status: 201 })
}

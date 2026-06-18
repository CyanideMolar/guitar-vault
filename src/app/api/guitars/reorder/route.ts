import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids must be an array' }, { status: 400 })

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.guitar.updateMany({
        where: { id, ownerId: session.user!.id },
        data: { sortOrder: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}

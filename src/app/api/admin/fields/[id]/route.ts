import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.role === 'ADMIN' ? user : null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { label, fieldType, options, required, sortOrder } = body

  const field = await prisma.customField.update({
    where: { id },
    data: {
      label,
      fieldType,
      options: options ? JSON.stringify(options) : null,
      required,
      sortOrder,
    },
  })

  return NextResponse.json(field)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.customField.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

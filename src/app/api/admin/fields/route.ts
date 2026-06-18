import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.role === 'ADMIN' ? user : null
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fields = await prisma.customField.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(fields)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { label, fieldType, options, required, sortOrder } = body

  if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 })

  const field = await prisma.customField.create({
    data: {
      label,
      fieldType: fieldType ?? 'TEXT',
      options: options ? JSON.stringify(options) : null,
      required: required ?? false,
      sortOrder: sortOrder ?? 0,
    },
  })

  return NextResponse.json(field, { status: 201 })
}

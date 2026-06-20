import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  }
  if (!extMap[file.type]) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = extMap[file.type]
  const filename = `${session.user.id}-${Date.now()}.${ext}`
  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads')
  const uploadPath = path.join(uploadDir, filename)

  await writeFile(uploadPath, buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}

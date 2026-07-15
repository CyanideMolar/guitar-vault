import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

// Deliberately unauthenticated -- matches the existing precedent that
// imageUrl files under /uploads/ are already served by nginx with zero
// access control (scripts/nginx.conf). This doesn't lower that bar.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guitar = await prisma.guitar.findUnique({ where: { id }, select: { imageUrl: true } })
  if (!guitar?.imageUrl) {
    return NextResponse.json({ error: 'No image' }, { status: 404 })
  }

  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads')
  const filename = path.basename(guitar.imageUrl)
  const inputPath = path.join(uploadDir, filename)

  try {
    const thumbnail = await sharp(inputPath)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    return new NextResponse(new Uint8Array(thumbnail), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=2592000, immutable',
      },
    })
  } catch {
    // Source format sharp can't handle in this deployment (e.g. HEIC/HEIF
    // without libheif support) or the file is missing/corrupt -- the dial
    // treats a 404 here as "show a placeholder icon," not an error.
    return NextResponse.json({ error: 'Could not generate thumbnail' }, { status: 404 })
  }
}

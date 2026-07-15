import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import type sharpType from 'sharp'
import { prisma } from '@/lib/prisma'

// A plain top-level `import sharp from 'sharp'` gets caught by Turbopack's
// external-module handling for this native package, which -- confirmed
// against this project's actual production deploy -- generates a runtime
// reference (`sharp-<hash>`) that fails to resolve even on a from-scratch,
// architecture-matched build (ERR_MODULE_NOT_FOUND), despite `sharp` itself
// installing and loading correctly via a plain `require('sharp')` on the
// same box. Routing the require through `eval` hides it from static bundler
// analysis entirely, forcing real Node module resolution at runtime instead.
const sharp: typeof sharpType = eval('require')('sharp')

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
    // 120x120 -- matches the Musician Dial's actual on-screen display size
    // exactly, so the firmware can draw it 1:1 with no client-side scaling.
    // (LVGL's scaled-image draw path has a real bug that divides by zero
    // under certain clip conditions; unscaled 1:1 draws don't go through it.)
    const thumbnail = await sharp(inputPath)
      .resize(120, 120, { fit: 'cover' })
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

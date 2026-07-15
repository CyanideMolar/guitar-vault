import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashApiKey } from '@/lib/api-key'

// Returns the authenticated user's id, trying a NextAuth session first (web
// UI) and falling back to an `Authorization: Bearer <api key>` header
// (Musician Dial). Returns null if neither is present/valid.
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const key = authHeader.slice('Bearer '.length).trim()
  if (!key) return null

  const hashedKey = hashApiKey(key)
  const apiKey = await prisma.apiKey.findUnique({ where: { hashedKey } })
  if (!apiKey || apiKey.revokedAt) return null

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
  return apiKey.userId
}

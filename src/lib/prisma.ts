import path from 'path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/generated/prisma/client'

// DATABASE_URL is "file:./prisma/dev.db" — strip the "file:" prefix and resolve
const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
const dbPath = path.resolve(process.cwd(), dbUrl.replace(/^file:/, ''))

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbPath }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

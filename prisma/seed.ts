import path from 'path'
import Database from 'better-sqlite3'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Promote the first user to ADMIN (run after first sign-in)
  const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
  if (firstUser) {
    await prisma.user.update({ where: { id: firstUser.id }, data: { role: 'ADMIN' } })
    console.log(`Promoted ${firstUser.email} to ADMIN`)
  } else {
    console.log('No users yet — sign in first, then run seed again.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    error: '/',
  },
  events: {
    async createUser({ user }) {
      const adminEmail = (process.env.ADMIN_EMAIL ?? '').toLowerCase()
      if (adminEmail && user.email?.toLowerCase() === adminEmail) {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } })
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      const email = (user.email ?? '').toLowerCase()
      if (!email) return false

      const count = await prisma.allowedEmail.count()
      if (count > 0) {
        const match = await prisma.allowedEmail.findUnique({ where: { email } })
        return !!match
      }

      // Fallback: env var for bootstrapping a fresh instance
      const envList = (process.env.ALLOWED_EMAILS ?? '')
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
      return envList.includes(email)
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.image = user.image
        // @ts-expect-error role is added via db
        session.user.role = user.role
      }
      return session
    },
  },
})

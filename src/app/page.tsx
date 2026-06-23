import Link from 'next/link'
import { auth, signIn } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Guitar, Plus, ShieldCheck } from 'lucide-react'
import { QuickMaintenanceModal } from '@/components/quick-maintenance-modal'

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Guitar className="mb-4 h-16 w-16 text-sky-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Guitar Vault</h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-slate-400">
          Track your collection, manage maintenance, and keep your gear in top shape.
        </p>
        <form action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/guitars' })
        }}>
          <button
            type="submit"
            className="mt-8 rounded-lg bg-sky-100 px-6 py-3 text-base font-semibold text-sky-800 hover:bg-sky-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    )
  }

  const [user, guitars] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user!.id } }),
    prisma.guitar.findMany({
      where: { ownerId: session.user!.id },
      select: { id: true, name: true, brand: true, model: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Welcome back, {session.user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-slate-400">What would you like to do today?</p>
      </div>

      <div className={`grid gap-4 ${isAdmin ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Link
          href="/guitars"
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="rounded-lg bg-sky-100 p-2 dark:bg-blue-900/50">
            <Guitar className="h-6 w-6 text-sky-700 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">My Collection</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Browse and manage your guitars</p>
          </div>
        </Link>

        <Link
          href="/guitars/new"
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/50">
            <Plus className="h-6 w-6 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">Add Guitar</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Add a new guitar to your collection</p>
          </div>
        </Link>
        <QuickMaintenanceModal guitars={guitars} userName={session.user?.name} />

        {isAdmin && (
          <Link
            href="/admin/access"
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="rounded-lg bg-sky-100 p-2 dark:bg-blue-900/50">
              <ShieldCheck className="h-6 w-6 text-sky-700 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Access Control</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Manage who can sign in</p>
            </div>
          </Link>
        )}
      </div>


    </div>
  )
}

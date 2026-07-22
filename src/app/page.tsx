import Link from 'next/link'
import { auth, signIn } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Guitar, Plus, ShieldCheck, Wrench } from 'lucide-react'
import { QuickMaintenanceModal } from '@/components/quick-maintenance-modal'
import { LogPracticeSessionModal } from '@/components/log-practice-session-modal'
import { formatDate, formatCurrency } from '@/lib/utils'

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

  const [user, guitars, recentMaintenance] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user!.id } }),
    prisma.guitar.findMany({
      where: { ownerId: session.user!.id },
      select: { id: true, name: true, brand: true, model: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.maintenanceRecord.findMany({
      where: { guitar: { ownerId: session.user!.id } },
      include: { guitar: { select: { id: true, name: true, brand: true, model: true } } },
      orderBy: { date: 'desc' },
      take: 5,
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
        <LogPracticeSessionModal guitars={guitars} />

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

      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
            <Wrench className="h-5 w-5 text-gray-400 dark:text-slate-500" /> Recent Maintenance
          </h2>
          {recentMaintenance.length > 0 && (
            <Link href="/maintenance" className="text-sm font-medium text-sky-700 hover:text-sky-800 dark:text-blue-400 dark:hover:text-blue-300">
              View all
            </Link>
          )}
        </div>

        {recentMaintenance.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
            <Wrench className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">No maintenance records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/60">
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wide text-xs text-gray-500 dark:text-slate-400">Guitar</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wide text-xs text-gray-500 dark:text-slate-400">Date</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wide text-xs text-gray-500 dark:text-slate-400">Type</th>
                  <th className="px-4 py-2 text-left font-medium uppercase tracking-wide text-xs text-gray-500 dark:text-slate-400">Notes</th>
                  <th className="px-4 py-2 text-right font-medium uppercase tracking-wide text-xs text-gray-500 dark:text-slate-400">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                {recentMaintenance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-slate-100">{record.guitar.name}</div>
                      {(record.guitar.brand || record.guitar.model) && (
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          {[record.guitar.brand, record.guitar.model].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-slate-300 tabular-nums">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {record.taskType.split(',').map((t) => t.trim()).filter(Boolean).map((task) => (
                          <span key={task} className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {task}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-600 dark:text-slate-400">
                      {record.notes ?? <span className="text-gray-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-slate-300">
                      {record.cost != null ? formatCurrency(record.cost) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Guitar, Wrench } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function MaintenancePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const records = await prisma.maintenanceRecord.findMany({
    where: { guitar: { ownerId: session.user.id } },
    include: { guitar: { select: { id: true, name: true, brand: true, model: true, imageUrl: true } } },
    orderBy: { date: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
          <Wrench className="h-6 w-6 text-gray-400 dark:text-slate-500" /> My Maintenance
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          All maintenance activity across your collection
        </p>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-24 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
          <Wrench className="mx-auto mb-3 h-10 w-10" />
          <p>No maintenance records yet.</p>
          <p className="mt-1 text-sm">Open a guitar and tap &ldquo;Add Maintenance&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Link href={`/guitars/${record.guitar.id}`} className="mt-0.5 flex h-14 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 dark:bg-slate-700">
                    {record.guitar.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={record.guitar.imageUrl} alt={record.guitar.name} className="h-full w-full object-cover" />
                    ) : (
                      <Guitar className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                    )}
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1">
                      {record.taskType.split(',').map((t) => t.trim()).filter(Boolean).map((task) => (
                        <span key={task} className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {task}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                      <Link
                        href={`/guitars/${record.guitar.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-sky-700 dark:text-slate-100 dark:hover:text-blue-400"
                      >
                        {record.guitar.name}
                      </Link>
                      {(record.guitar.brand || record.guitar.model) && (
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {[record.guitar.brand, record.guitar.model].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{record.notes}</p>
                    )}
                    {record.performedBy && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">By: {record.performedBy}</p>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right text-sm">
                  <div className="font-medium text-gray-700 dark:text-slate-300">{formatDate(record.date)}</div>
                  {record.cost != null && (
                    <div className="text-gray-400 dark:text-slate-500">{formatCurrency(record.cost)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

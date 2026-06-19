import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Plus, Download } from 'lucide-react'
import { SortableGuitarGrid } from '@/components/sortable-guitar-grid'

export default async function GuitarsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const guitars = await prisma.guitar.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { maintenanceRecords: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">My Collection</h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/guitars/export"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Download collection as Markdown for use with AI"
          >
            <Download className="h-4 w-4" /> Export
          </a>
          <Link
            href="/guitars/new"
            className="flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
          >
            <Plus className="h-4 w-4" /> Add Guitar
          </Link>
        </div>
      </div>

      <SortableGuitarGrid guitars={guitars} />
    </div>
  )
}

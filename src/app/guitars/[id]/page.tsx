import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Guitar, Edit, Wrench } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { DeleteGuitarButton } from '@/components/delete-guitar-button'
import { ImageLightbox } from '@/components/image-lightbox'
import { AddMaintenanceModal } from '@/components/add-maintenance-modal'
import { DeleteMaintenanceButton } from '@/components/delete-maintenance-button'

export default async function GuitarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const { id } = await params
  const guitar = await prisma.guitar.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      customFieldValues: { include: { customField: true } },
      maintenanceRecords: {
        include: { user: { select: { name: true } } },
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!guitar) notFound()

  const details: { label: string; value: string | null | undefined }[] = [
    { label: 'Brand', value: guitar.brand },
    { label: 'Model', value: guitar.model },
    { label: 'Serial Number', value: guitar.serialNumber },
    { label: 'Bridge Pickup', value: guitar.bridgePickup },
    { label: 'Neck Pickup', value: guitar.neckPickup },
    { label: 'Middle Pickup', value: guitar.middlePickup },
    { label: 'Preferred Tuning', value: guitar.preferredTuning },
    { label: 'Preferred String Gauge', value: guitar.preferredStringGauge },
  ]

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href="/guitars" className="text-sm text-gray-500 hover:text-gray-700">
            Collection
          </Link>
          <span className="text-gray-300">/</span>
          <span className="truncate text-sm font-medium text-gray-900">{guitar.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/guitars/${guitar.id}/edit`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </Link>
          <DeleteGuitarButton id={guitar.id} name={guitar.name} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header — stacks vertically on mobile */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
          <div className="flex aspect-[3/4] w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:w-56">
            {guitar.imageUrl ? (
              <ImageLightbox src={guitar.imageUrl} alt={guitar.name} />
            ) : (
              <Guitar className="h-12 w-12 text-gray-300" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{guitar.name}</h1>
            {(guitar.brand || guitar.model) && (
              <p className="mt-1 text-gray-500">
                {[guitar.brand, guitar.model].filter(Boolean).join(' · ')}
              </p>
            )}
            {guitar.notes && <p className="mt-3 text-sm text-gray-600">{guitar.notes}</p>}
          </div>
        </div>

        {/* Core details */}
        <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {details.filter((d) => d.value).map((d) => (
              <div key={d.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{d.label}</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{d.value}</dd>
              </div>
            ))}
            {guitar.customFieldValues.map((cfv) => (
              <div key={cfv.id}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {cfv.customField.label}
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{cfv.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Maintenance */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Wrench className="h-5 w-5 text-gray-400" /> Maintenance History
          </h2>
          <AddMaintenanceModal guitarId={guitar.id} />
        </div>

        {guitar.maintenanceRecords.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
            No maintenance records yet.
          </div>
        ) : (
          <div className="space-y-3">
            {guitar.maintenanceRecords.map((record) => (
              <div key={record.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1">
                      {record.taskType.split(',').map((t) => t.trim()).filter(Boolean).map((task) => (
                        <span key={task} className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {task}
                        </span>
                      ))}
                    </div>
                    {record.notes && (
                      <p className="mt-2 text-sm text-gray-700">{record.notes}</p>
                    )}
                    {record.performedBy && (
                      <p className="mt-1 text-xs text-gray-400">By: {record.performedBy}</p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-start gap-1">
                    <div className="mr-1 text-right text-sm">
                      <div className="font-medium text-gray-700">{formatDate(record.date)}</div>
                      {record.cost != null && (
                        <div className="text-gray-400">{formatCurrency(record.cost)}</div>
                      )}
                    </div>
                    <AddMaintenanceModal guitarId={guitar.id} record={record} />
                    <DeleteMaintenanceButton guitarId={guitar.id} recordId={record.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

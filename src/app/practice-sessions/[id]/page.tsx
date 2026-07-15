import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Guitar, Timer } from 'lucide-react'
import { formatDate, formatDuration, RATING_LABELS } from '@/lib/utils'
import { DeletePracticeSessionButton } from '@/components/delete-practice-session-button'

export default async function PracticeSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const { id } = await params
  const practiceSession = await prisma.practiceSession.findFirst({
    where: { id, userId: session.user.id },
    include: {
      segments: {
        include: { guitar: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!practiceSession) notFound()

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/practice-sessions" className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
          Practice Sessions
        </Link>
        <span className="text-gray-300 dark:text-slate-600">/</span>
        <span className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{formatDate(practiceSession.createdAt)}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-4 p-6">
          <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
            <Timer className="h-6 w-6 text-purple-700 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatDuration(practiceSession.totalDurationSeconds)}</h1>
            <p className="mt-1 text-gray-500 dark:text-slate-400">{formatDate(practiceSession.createdAt)}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              How it went: <span className="font-medium">{RATING_LABELS[practiceSession.rating]}</span> ({practiceSession.rating}/5)
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 dark:border-slate-700">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
            Per-guitar breakdown
          </h2>
          <div className="space-y-2">
            {practiceSession.segments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-slate-700"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 dark:bg-slate-700">
                    {segment.guitar.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={segment.guitar.imageUrl} alt={segment.guitar.name} className="h-full w-full object-cover" />
                    ) : (
                      <Guitar className="h-4 w-4 text-gray-300 dark:text-slate-600" />
                    )}
                  </div>
                  <Link
                    href={`/guitars/${segment.guitar.id}`}
                    className="truncate text-sm font-medium text-gray-900 hover:underline dark:text-slate-100"
                  >
                    {segment.guitar.name}
                  </Link>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-600 dark:text-slate-400">{formatDuration(segment.durationSeconds)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <DeletePracticeSessionButton id={practiceSession.id} />
      </div>
    </div>
  )
}

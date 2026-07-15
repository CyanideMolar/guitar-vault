import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Timer, Guitar } from 'lucide-react'
import { formatDate, formatDuration, RATING_LABELS } from '@/lib/utils'

export default async function PracticeSessionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const sessions = await prisma.practiceSession.findMany({
    where: { userId: session.user.id },
    include: {
      segments: {
        include: { guitar: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
          <Timer className="h-6 w-6 text-gray-400 dark:text-slate-500" /> Practice Sessions
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          All practice activity across your collection
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-24 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
          <Timer className="mx-auto mb-3 h-10 w-10" />
          <p>No practice sessions logged yet.</p>
          <p className="mt-1 text-sm">Tap &ldquo;Log Practice Session&rdquo; from the home page to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((practiceSession) => {
            const guitarNames = practiceSession.segments.map((seg) => seg.guitar.name).join(', ')
            const thumb = practiceSession.segments[0]?.guitar.imageUrl

            return (
              <Link
                key={practiceSession.id}
                href={`/practice-sessions/${practiceSession.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 flex h-14 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 dark:bg-slate-700">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={guitarNames} className="h-full w-full object-cover" />
                      ) : (
                        <Guitar className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{guitarNames}</div>
                      <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{RATING_LABELS[practiceSession.rating]}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right text-sm">
                    <div className="font-medium text-gray-700 dark:text-slate-300">{formatDuration(practiceSession.totalDurationSeconds)}</div>
                    <div className="text-gray-400 dark:text-slate-500">{formatDate(practiceSession.createdAt)}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

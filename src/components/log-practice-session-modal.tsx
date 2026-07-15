'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, X } from 'lucide-react'
import { RATING_LABELS } from '@/lib/utils'

type Guitar = { id: string; name: string; brand?: string | null; model?: string | null }

export function LogPracticeSessionModal({ guitars }: { guitars: Guitar[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedGuitarId, setSelectedGuitarId] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [duration, setDuration] = useState({ h: '', m: '', s: '' })

  function openModal() {
    setSelectedGuitarId(guitars.length === 1 ? guitars[0].id : '')
    setRating(null)
    setDuration({ h: '', m: '', s: '' })
    setOpen(true)
  }

  const durationSeconds = (Number(duration.h) || 0) * 3600 + (Number(duration.m) || 0) * 60 + (Number(duration.s) || 0)
  const canSubmit = !!selectedGuitarId && durationSeconds > 0 && rating !== null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    try {
      await fetch('/api/practice-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guitarId: selectedGuitarId, durationSeconds, rating }),
      })
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400'

  const guitarLabel = (g: Guitar) =>
    [g.name, [g.brand, g.model].filter(Boolean).join(' ')].filter(Boolean).join(' — ')

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800 text-left w-full"
      >
        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/50 flex-shrink-0">
          <Timer className="h-6 w-6 text-purple-700 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Log Practice Session</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Record a practice session for any guitar</p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Log Practice Session</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-slate-700">
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Guitar *</label>
                  <select
                    value={selectedGuitarId}
                    onChange={(e) => setSelectedGuitarId(e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="">Select a guitar…</option>
                    {guitars.map((g) => (
                      <option key={g.id} value={g.id}>{guitarLabel(g)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Duration *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input type="number" min="0" value={duration.h} onChange={(e) => setDuration((d) => ({ ...d, h: e.target.value }))} placeholder="0" className={inputCls} />
                      <p className="mt-1 text-center text-xs text-gray-400 dark:text-slate-500">hours</p>
                    </div>
                    <div>
                      <input type="number" min="0" max="59" value={duration.m} onChange={(e) => setDuration((d) => ({ ...d, m: e.target.value }))} placeholder="0" className={inputCls} />
                      <p className="mt-1 text-center text-xs text-gray-400 dark:text-slate-500">min</p>
                    </div>
                    <div>
                      <input type="number" min="0" max="59" value={duration.s} onChange={(e) => setDuration((d) => ({ ...d, s: e.target.value }))} placeholder="0" className={inputCls} />
                      <p className="mt-1 text-center text-xs text-gray-400 dark:text-slate-500">sec</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">How did it go? *</label>
                  <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                          rating === n
                            ? 'border-sky-300 bg-sky-100 text-sky-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-slate-500">
                    <span>{RATING_LABELS[1]}</span>
                    <span>{RATING_LABELS[5]}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={saving || !canSubmit}
                  className="flex-1 rounded-lg bg-sky-100 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 disabled:opacity-50 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                >
                  {saving ? 'Saving…' : 'Save Session'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

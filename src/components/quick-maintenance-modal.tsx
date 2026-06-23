'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, X } from 'lucide-react'
import { MAINTENANCE_TASKS } from '@/lib/maintenance-tasks'

type Guitar = { id: string; name: string; brand?: string | null; model?: string | null }

export function QuickMaintenanceModal({ guitars, userName }: { guitars: Guitar[]; userName?: string | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedGuitarId, setSelectedGuitarId] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    cost: '',
    performedBy: userName ?? '',
  })

  function openModal() {
    setSelectedGuitarId(guitars.length === 1 ? guitars[0].id : '')
    setSelectedTasks([])
    setForm({ date: new Date().toISOString().split('T')[0], notes: '', cost: '', performedBy: userName ?? '' })
    setOpen(true)
  }

  function toggleTask(task: string) {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedGuitarId || selectedTasks.length === 0) return
    setSaving(true)
    try {
      await fetch(`/api/guitars/${selectedGuitarId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, taskType: selectedTasks.join(', ') }),
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

  const canSubmit = !!selectedGuitarId && selectedTasks.length > 0

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800 text-left w-full"
      >
        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50 flex-shrink-0">
          <Wrench className="h-6 w-6 text-amber-700 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Log Maintenance</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Record a maintenance task for any guitar</p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Log Maintenance</h2>
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
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Tasks *{selectedTasks.length > 0 && (
                      <span className="font-normal text-gray-400 dark:text-slate-500"> ({selectedTasks.length} selected)</span>
                    )}
                  </label>
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 dark:border-slate-600 dark:divide-slate-700">
                    {MAINTENANCE_TASKS.map((task) => (
                      <label
                        key={task}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task)}
                          onChange={() => toggleTask(task)}
                          className="h-4 w-4 rounded border-gray-300 accent-sky-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-slate-300">{task}</span>
                      </label>
                    ))}
                  </div>
                  {selectedTasks.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">Select at least one task</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Details about the work done…"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Cost ($)</label>
                    <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Performed by</label>
                    <input type="text" value={form.performedBy} onChange={(e) => setForm((f) => ({ ...f, performedBy: e.target.value }))} placeholder="Tech name or self" className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={saving || !canSubmit}
                  className="flex-1 rounded-lg bg-sky-100 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 disabled:opacity-50 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                >
                  {saving ? 'Saving…' : 'Save Record'}
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

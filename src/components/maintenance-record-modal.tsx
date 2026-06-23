'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Guitar, Pencil, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { MAINTENANCE_TASKS } from '@/lib/maintenance-tasks'
import { formatDate, formatCurrency } from '@/lib/utils'

type MaintenanceRecord = {
  id: string
  taskType: string
  date: Date
  notes?: string | null
  cost?: number | null
  performedBy?: string | null
}

type GuitarInfo = {
  id: string
  name: string
  brand?: string | null
  model?: string | null
  imageUrl?: string | null
}

type Props = {
  guitarId: string
  record: MaintenanceRecord
  userName?: string | null
  guitar?: GuitarInfo
  trigger: React.ReactNode
}

type ModalState = 'view' | 'edit' | 'delete-confirm'

function parseTasks(taskType: string): string[] {
  return taskType.split(',').map((t) => t.trim()).filter(Boolean)
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400'

export function MaintenanceRecordModal({ guitarId, record, userName, guitar, trigger }: Props) {
  const router = useRouter()
  const [state, setState] = useState<ModalState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [form, setForm] = useState({ date: '', notes: '', cost: '', performedBy: '' })

  function open() {
    setState('view')
  }

  function openEdit() {
    setSelectedTasks(parseTasks(record.taskType))
    setForm({
      date: new Date(record.date).toISOString().split('T')[0],
      notes: record.notes ?? '',
      cost: record.cost != null ? String(record.cost) : '',
      performedBy: record.performedBy ?? userName ?? '',
    })
    setState('edit')
  }

  function close() {
    setState(null)
  }

  function toggleTask(task: string) {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (selectedTasks.length === 0) return
    setSaving(true)
    try {
      await fetch(`/api/guitars/${guitarId}/maintenance/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, taskType: selectedTasks.join(', ') }),
      })
      close()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/guitars/${guitarId}/maintenance/${record.id}`, { method: 'DELETE' })
      close()
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  const tasks = parseTasks(record.taskType)

  return (
    <>
      <div onClick={open} className="cursor-pointer">
        {trigger}
      </div>

      {state && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-800">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {state === 'view' && 'Maintenance Record'}
                {state === 'edit' && 'Edit Record'}
                {state === 'delete-confirm' && 'Delete Record'}
              </h2>
              <button onClick={close} className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-slate-700">
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* View state */}
            {state === 'view' && (
              <div className="overflow-y-auto p-5">
                <div className="space-y-4">
                  {guitar && (
                    <Link
                      href={`/guitars/${guitar.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                    >
                      <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 dark:bg-slate-700">
                        {guitar.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={guitar.imageUrl} alt={guitar.name} className="h-full w-full object-cover" />
                        ) : (
                          <Guitar className="h-4 w-4 text-gray-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{guitar.name}</p>
                        {(guitar.brand || guitar.model) && (
                          <p className="text-xs text-gray-400 dark:text-slate-500">{[guitar.brand, guitar.model].filter(Boolean).join(' · ')}</p>
                        )}
                      </div>
                    </Link>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Tasks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tasks.map((task) => (
                        <span key={task} className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Date</p>
                      <p className="mt-0.5 text-sm text-gray-900 dark:text-slate-100">{formatDate(record.date)}</p>
                    </div>
                    {record.cost != null && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Cost</p>
                        <p className="mt-0.5 text-sm text-gray-900 dark:text-slate-100">{formatCurrency(record.cost)}</p>
                      </div>
                    )}
                    {record.performedBy && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Performed by</p>
                        <p className="mt-0.5 text-sm text-gray-900 dark:text-slate-100">{record.performedBy}</p>
                      </div>
                    )}
                  </div>

                  {record.notes && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Notes</p>
                      <p className="mt-0.5 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{record.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={openEdit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-100 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setState('delete-confirm')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* Edit state */}
            {state === 'edit' && (
              <form onSubmit={handleSave} className="overflow-y-auto p-5">
                <div className="space-y-4">
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
                    disabled={saving || selectedTasks.length === 0}
                    className="flex-1 rounded-lg bg-sky-100 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 disabled:opacity-50 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setState('view')}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Delete confirm state */}
            {state === 'delete-confirm' && (
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Are you sure you want to delete this maintenance record? This cannot be undone.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setState('view')}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, X } from 'lucide-react'
import { MAINTENANCE_TASKS } from '@/lib/maintenance-tasks'

type MaintenanceRecord = {
  id: string
  taskType: string
  date: Date
  notes?: string | null
  cost?: number | null
  performedBy?: string | null
}

type Props =
  | { guitarId: string; record?: undefined }
  | { guitarId: string; record: MaintenanceRecord }

function parseTasks(taskType: string): string[] {
  return taskType.split(',').map((t) => t.trim()).filter(Boolean)
}

export function AddMaintenanceModal({ guitarId, record }: Props) {
  const router = useRouter()
  const isEdit = !!record

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    record ? parseTasks(record.taskType) : []
  )
  const [form, setForm] = useState({
    date: record ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: record?.notes ?? '',
    cost: record?.cost != null ? String(record.cost) : '',
    performedBy: record?.performedBy ?? '',
  })

  function openModal() {
    if (isEdit) {
      setSelectedTasks(parseTasks(record.taskType))
      setForm({
        date: new Date(record.date).toISOString().split('T')[0],
        notes: record.notes ?? '',
        cost: record.cost != null ? String(record.cost) : '',
        performedBy: record.performedBy ?? '',
      })
    }
    setOpen(true)
  }

  function toggleTask(task: string) {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedTasks.length === 0) return
    setSaving(true)
    try {
      const url = isEdit
        ? `/api/guitars/${guitarId}/maintenance/${record.id}`
        : `/api/guitars/${guitarId}/maintenance`
      await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, taskType: selectedTasks.join(', ') }),
      })
      setOpen(false)
      if (!isEdit) {
        setSelectedTasks([])
        setForm({ date: new Date().toISOString().split('T')[0], notes: '', cost: '', performedBy: '' })
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={openModal}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Edit record"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" /> Add Maintenance
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Edit Maintenance Record' : 'Log Maintenance'}
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tasks * {selectedTasks.length > 0 && (
                      <span className="font-normal text-gray-400">({selectedTasks.length} selected)</span>
                    )}
                  </label>
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {MAINTENANCE_TASKS.map((task) => (
                      <label
                        key={task}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task)}
                          onChange={() => toggleTask(task)}
                          className="h-4 w-4 rounded border-gray-300 accent-amber-600"
                        />
                        <span className="text-sm text-gray-700">{task}</span>
                      </label>
                    ))}
                  </div>
                  {selectedTasks.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">Select at least one task</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Details about the work done…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cost}
                      onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Performed by</label>
                    <input
                      type="text"
                      value={form.performedBy}
                      onChange={(e) => setForm((f) => ({ ...f, performedBy: e.target.value }))}
                      placeholder="Tech name or self"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={saving || selectedTasks.length === 0}
                  className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
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

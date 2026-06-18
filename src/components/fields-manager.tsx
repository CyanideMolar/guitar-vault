'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { CustomField } from '@/generated/prisma/client'

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'SELECT', label: 'Dropdown' },
  { value: 'BOOLEAN', label: 'Yes / No' },
  { value: 'DATE', label: 'Date' },
]

interface FieldsManagerProps {
  fields: CustomField[]
  isAdmin: boolean
}

export function FieldsManager({ fields: initial, isAdmin }: FieldsManagerProps) {
  const router = useRouter()
  const [fields, setFields] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newField, setNewField] = useState({
    label: '',
    fieldType: 'TEXT',
    options: '',
    required: false,
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const options =
        newField.fieldType === 'SELECT'
          ? newField.options
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined

      const res = await fetch('/api/admin/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newField,
          options,
          sortOrder: fields.length,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setFields((f) => [...f, created])
        setNewField({ label: '', fieldType: 'TEXT', options: '', required: false })
        setAdding(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/fields/${id}`, { method: 'DELETE' })
    setFields((f) => f.filter((field) => field.id !== id))
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {fields.length === 0 && !adding && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-gray-400">
          No custom fields defined yet.
        </div>
      )}

      {fields.map((field) => (
        <div
          key={field.id}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{field.label}</span>
              {field.required && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Required</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
              <span>{FIELD_TYPES.find((t) => t.value === field.fieldType)?.label ?? field.fieldType}</span>
              {field.options && (
                <span className="text-gray-300">
                  · {(JSON.parse(field.options) as string[]).join(', ')}
                </span>
              )}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleDelete(field.id)}
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      {isAdmin && (
        <>
          {adding ? (
            <form
              onSubmit={handleAdd}
              className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-4"
            >
              <h3 className="font-medium text-gray-900">New Field</h3>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Label *</label>
                <input
                  type="text"
                  value={newField.label}
                  onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))}
                  required
                  placeholder="e.g. Year, Country of Origin"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newField.fieldType}
                  onChange={(e) => setNewField((f) => ({ ...f, fieldType: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {newField.fieldType === 'SELECT' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Options (one per line)
                  </label>
                  <textarea
                    value={newField.options}
                    onChange={(e) => setNewField((f) => ({ ...f, options: e.target.value }))}
                    rows={4}
                    placeholder={'Electric\nAcoustic\nBass\nClassical'}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField((f) => ({ ...f, required: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600"
                />
                <label htmlFor="required" className="text-sm text-gray-700">
                  Required field
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving || !newField.label}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Adding…' : 'Add Field'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm text-gray-500 hover:border-amber-300 hover:text-amber-700"
            >
              <Plus className="h-4 w-4" /> Add Custom Field
            </button>
          )}
        </>
      )}
    </div>
  )
}

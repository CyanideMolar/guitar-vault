'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import type { CustomField } from '@/generated/prisma/client'

interface GuitarFormProps {
  initialData?: {
    id: string
    name: string
    amber?: string | null
    model?: string | null
    serialNumber?: string | null
    bridgePickup?: string | null
    neckPickup?: string | null
    middlePickup?: string | null
    preferredTuning?: string | null
    preferredStringGauge?: string | null
    imageUrl?: string | null
    notes?: string | null
    customFieldValues?: { customFieldId: string; value: string }[]
  }
  customFields: CustomField[]
}

export function GuitarForm({ initialData, customFields }: GuitarFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!initialData

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    amber: initialData?.amber ?? '',
    model: initialData?.model ?? '',
    serialNumber: initialData?.serialNumber ?? '',
    bridgePickup: initialData?.bridgePickup ?? '',
    neckPickup: initialData?.neckPickup ?? '',
    middlePickup: initialData?.middlePickup ?? '',
    preferredTuning: initialData?.preferredTuning ?? '',
    preferredStringGauge: initialData?.preferredStringGauge ?? '',
    imageUrl: initialData?.imageUrl ?? '',
    notes: initialData?.notes ?? '',
  })

  const [customValues, setCustomValues] = useState<Record<string, string>>(
    Object.fromEntries(
      (initialData?.customFieldValues ?? []).map((v) => [v.customFieldId, v.value])
    )
  )

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm((f) => ({ ...f, imageUrl: data.url }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isEdit ? `/api/guitars/${initialData.id}` : '/api/guitars'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, customFields: customValues }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }
      const guitar = await res.json()
      router.push(`/guitars/${guitar.id}`)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Image upload */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Photo</label>
        {form.imageUrl ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.imageUrl}
              alt="Guitar"
              className="h-40 w-56 rounded-lg object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
              className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-32 w-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-600"
          >
            <Upload className="mb-1 h-6 w-6" />
            <span className="text-sm">{uploading ? 'Uploading…' : 'Upload photo'}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field('Name *', 'name', 'e.g. My Les Paul')}
        {field('Brand', 'amber', 'e.g. Gibson')}
        {field('Model', 'model', 'e.g. Les Paul Standard')}
        {field('Serial Number', 'serialNumber')}
        {field('Bridge Pickup', 'bridgePickup', 'e.g. Burstbucker Pro')}
        {field('Neck Pickup', 'neckPickup', "e.g. '57 Classic")}
        {field('Middle Pickup', 'middlePickup', 'e.g. Single-coil')}

        {field('Preferred Tuning', 'preferredTuning', 'e.g. Standard, Drop D, Open G')}
        {field('Preferred String Gauge', 'preferredStringGauge', 'e.g. .010–.046')}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Custom fields */}
      {customFields.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Additional Fields</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {customFields.map((cf) => (
              <div key={cf.id}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {cf.label}
                  {cf.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                {cf.fieldType === 'SELECT' && cf.options ? (
                  <select
                    value={customValues[cf.id] ?? ''}
                    onChange={(e) => setCustomValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">— Select —</option>
                    {(JSON.parse(cf.options) as string[]).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : cf.fieldType === 'BOOLEAN' ? (
                  <select
                    value={customValues[cf.id] ?? ''}
                    onChange={(e) => setCustomValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">—</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type={cf.fieldType === 'NUMBER' ? 'number' : cf.fieldType === 'DATE' ? 'date' : 'text'}
                    value={customValues[cf.id] ?? ''}
                    onChange={(e) => setCustomValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                    required={cf.required}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !form.name}
          className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Guitar'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

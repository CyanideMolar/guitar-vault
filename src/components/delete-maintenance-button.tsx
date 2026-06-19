'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteMaintenanceButton({ guitarId, recordId }: { guitarId: string; recordId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/guitars/${guitarId}/maintenance/${recordId}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-slate-400">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
      title="Delete record"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

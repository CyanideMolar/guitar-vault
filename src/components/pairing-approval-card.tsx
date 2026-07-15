'use client'

import { useState } from 'react'

export function PairingApprovalCard({ code }: { code: string }) {
  const [state, setState] = useState<'idle' | 'approving' | 'approved' | 'error'>('idle')

  async function approve() {
    setState('approving')
    try {
      const res = await fetch('/api/pair/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      setState(res.ok ? 'approved' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-800">
        <div className="border-b border-gray-200 p-5 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Pair Musician Dial</h2>
        </div>
        <div className="p-5">
          {state === 'approved' ? (
            <p className="text-sm text-gray-700 dark:text-slate-300">
              Paired! You can close this page and return to your dial.
            </p>
          ) : (
            <>
              <p className="mb-5 text-sm text-gray-700 dark:text-slate-300">
                A Musician Dial device is requesting access to your Guitar Vault account (code{' '}
                <span className="font-mono font-medium">{code}</span>). Approve only if you initiated
                this pairing yourself.
              </p>
              {state === 'error' && (
                <p className="mb-4 text-sm text-red-500">Something went wrong — try again.</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={approve}
                  disabled={state === 'approving'}
                  className="flex-1 rounded-lg bg-sky-100 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 disabled:opacity-50 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
                >
                  {state === 'approving' ? 'Approving…' : 'Approve'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

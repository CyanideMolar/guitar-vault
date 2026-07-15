import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PairingApprovalCard } from '@/components/pairing-approval-card'

export default async function PairPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const { code } = await searchParams

  const pairingRequest = code
    ? await prisma.pairingRequest.findUnique({ where: { code } })
    : null
  const valid = pairingRequest && pairingRequest.status === 'PENDING' && pairingRequest.expiresAt > new Date()

  if (!code || !valid) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">Pairing link invalid</h2>
          <p className="text-sm text-gray-700 dark:text-slate-300">
            This pairing link is invalid or has expired. Restart pairing from your Musician Dial.
          </p>
        </div>
      </div>
    )
  }

  return <PairingApprovalCard code={code} />
}

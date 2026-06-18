import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GuitarForm } from '@/components/guitar-form'

export default async function NewGuitarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const customFields = await prisma.customField.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Guitar</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <GuitarForm customFields={customFields} />
      </div>
    </div>
  )
}

import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GuitarForm } from '@/components/guitar-form'

export default async function EditGuitarPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const { id } = await params
  const [guitar, customFields] = await Promise.all([
    prisma.guitar.findFirst({
      where: { id, ownerId: session.user.id },
      include: { customFieldValues: true },
    }),
    prisma.customField.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  if (!guitar) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit {guitar.name}</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <GuitarForm initialData={guitar} customFields={customFields} />
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FieldsManager } from '@/components/fields-manager'

export default async function AdminFieldsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'ADMIN') redirect('/')

  const fields = await prisma.customField.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define extra fields that appear on every guitar profile.
        </p>
      </div>
      <FieldsManager fields={fields} isAdmin={true} />
    </div>
  )
}

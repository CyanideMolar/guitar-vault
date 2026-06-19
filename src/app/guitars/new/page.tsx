import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { GuitarForm } from '@/components/guitar-form'

export default async function NewGuitarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">Add Guitar</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <GuitarForm />
      </div>
    </div>
  )
}

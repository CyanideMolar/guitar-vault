import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShieldCheck, UserPlus, UserX } from 'lucide-react'

export default async function AccessPage() {
  const session = await auth()
  // @ts-expect-error role is extended
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/')

  const allowed = await prisma.allowedEmail.findMany({ orderBy: { createdAt: 'asc' } })

  async function add(formData: FormData) {
    'use server'
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    if (!email) return
    await prisma.allowedEmail.upsert({
      where: { email },
      update: {},
      create: { email },
    })
    revalidatePath('/admin/access')
  }

  async function remove(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await prisma.allowedEmail.delete({ where: { id } })
    revalidatePath('/admin/access')
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
          <ShieldCheck className="h-6 w-6 text-sky-600" /> Access Control
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Only these Google accounts can sign in.
        </p>
      </div>

      <form action={add} className="mb-6 flex gap-2">
        <input
          name="email"
          type="email"
          placeholder="buddy@gmail.com"
          required
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
        >
          <UserPlus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {allowed.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">
            No emails yet — add one above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {allowed.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-900 dark:text-slate-100">{entry.email}</span>
                <form action={remove}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button
                    type="submit"
                    title="Remove"
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

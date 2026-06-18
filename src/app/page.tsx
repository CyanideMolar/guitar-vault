import Link from 'next/link'
import { auth, signIn } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Guitar, Plus, Wrench, Settings } from 'lucide-react'

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Guitar className="mb-4 h-16 w-16 text-amber-600" />
        <h1 className="text-4xl font-bold text-gray-900">Guitar Vault</h1>
        <p className="mt-3 text-lg text-gray-500">
          Track your collection, manage maintenance, and keep your gear in top shape.
        </p>
        <form action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/guitars' })
        }}>
          <button
            type="submit"
            className="mt-8 rounded-lg bg-amber-600 px-6 py-3 text-base font-semibold text-white hover:bg-amber-700"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    )
  }

  const user = await prisma.user.findUnique({ where: { id: session.user!.id } })
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-gray-500">What would you like to do today?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/guitars"
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="rounded-lg bg-amber-100 p-2">
            <Guitar className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">My Collection</h2>
            <p className="mt-1 text-sm text-gray-500">Browse and manage your guitars</p>
          </div>
        </Link>

        <Link
          href="/guitars/new"
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="rounded-lg bg-green-100 p-2">
            <Plus className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Add Guitar</h2>
            <p className="mt-1 text-sm text-gray-500">Add a new guitar to your collection</p>
          </div>
        </Link>

        {isAdmin && (
          <Link
            href="/admin/fields"
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="rounded-lg bg-blue-100 p-2">
              <Settings className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Custom Fields</h2>
              <p className="mt-1 text-sm text-gray-500">Add fields to guitar profiles</p>
            </div>
          </Link>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-amber-700" />
          <p className="text-sm font-medium text-amber-800">
            Tip: Open any guitar and tap &ldquo;Add Maintenance&rdquo; to log a service record.
          </p>
        </div>
      </div>
    </div>
  )
}

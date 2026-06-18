'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Guitar, Settings, LogOut, User, Wrench } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'

export function Nav() {
  const { data: session } = useSession()
  // @ts-expect-error role is extended
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Main row */}
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
              <Guitar className="h-5 w-5 text-amber-600" />
              <span>Guitar Vault</span>
            </Link>

            {/* Desktop nav links */}
            {session && (
              <div className="hidden items-center gap-5 sm:flex">
                <Link href="/guitars" className="text-sm text-gray-600 hover:text-gray-900">
                  <span className="flex items-center gap-1">
                    <Guitar className="h-3.5 w-3.5" /> My Collection
                  </span>
                </Link>
                <Link href="/maintenance" className="text-sm text-gray-600 hover:text-gray-900">
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5" /> My Maintenance
                  </span>
                </Link>
                {isAdmin && (
                  <Link href="/admin/fields" className="text-sm text-gray-600 hover:text-gray-900">
                    <span className="flex items-center gap-1">
                      <Settings className="h-3.5 w-3.5" /> Admin
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image ?? ''}
                    alt={session.user?.name ?? 'User'}
                    className="rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>
                    <User className="h-5 w-5 text-gray-500" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm text-gray-700 sm:block">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 sm:px-3"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google', { callbackUrl: '/guitars' })}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav links */}
        {session && (
          <div className="flex gap-1 overflow-x-auto border-t border-gray-100 pb-2 pt-2 sm:hidden">
            <Link
              href="/guitars"
              className="flex flex-shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              <Guitar className="h-3.5 w-3.5" /> My Collection
            </Link>
            <Link
              href="/maintenance"
              className="flex flex-shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              <Wrench className="h-3.5 w-3.5" /> My Maintenance
            </Link>
            {isAdmin && (
              <Link
                href="/admin/fields"
                className="flex flex-shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                <Settings className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

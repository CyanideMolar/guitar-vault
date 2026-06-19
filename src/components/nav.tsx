'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Guitar, LogOut, ShieldCheck, User, Wrench } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { ThemeToggle } from '@/components/theme-toggle'

export function Nav() {
  const { data: session } = useSession()
  // @ts-expect-error role is extended
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        {/* Main row */}
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-slate-100">
              <Guitar className="h-5 w-5 text-sky-600" />
              <span>Guitar Vault</span>
            </Link>

            {/* Desktop nav links */}
            {session && (
              <div className="hidden items-center gap-5 sm:flex">
                <Link href="/guitars" className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">
                  <span className="flex items-center gap-1">
                    <Guitar className="h-3.5 w-3.5" /> My Collection
                  </span>
                </Link>
                <Link href="/maintenance" className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5" /> My Maintenance
                  </span>
                </Link>
                {isAdmin && (
                  <Link href="/admin/access" className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Access
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

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
                    <User className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm text-gray-700 dark:text-slate-300 sm:block">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 sm:px-3"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google', { callbackUrl: '/guitars' })}
                className="rounded-md bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav links */}
        {session && (
          <div className="flex gap-1 overflow-x-auto border-t border-gray-100 pb-2 pt-2 dark:border-slate-700 sm:hidden">
            <Link
              href="/guitars"
              className="flex flex-shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <Guitar className="h-3.5 w-3.5" /> My Collection
            </Link>
            <Link
              href="/maintenance"
              className="flex flex-shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <Wrench className="h-3.5 w-3.5" /> My Maintenance
            </Link>
            {isAdmin && (
              <Link
                href="/admin/access"
                className="flex flex-shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Access
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

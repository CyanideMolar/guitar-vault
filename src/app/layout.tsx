import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/session-provider'
import { Nav } from '@/components/nav'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Guitar Vault',
  description: 'Track your guitar collection and maintenance history',
}

const themeScript = `
(function(){
  var t=localStorage.getItem('guitar-vault-theme')||'system';
  var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  if(dark)document.documentElement.classList.add('dark');
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex h-screen flex-col overflow-hidden bg-sky-50 font-sans dark:bg-slate-900">
        <Providers>
          <Nav />
          <div className="flex-1 overflow-y-auto">
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

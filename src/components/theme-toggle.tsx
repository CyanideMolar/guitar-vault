'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const saved = (localStorage.getItem('guitar-vault-theme') as Theme) || 'system'
    setTheme(saved)
  }, [])

  useEffect(() => {
    const apply = (t: Theme) => {
      const dark =
        t === 'dark' ||
        (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', dark)
    }

    apply(theme)
    localStorage.setItem('guitar-vault-theme', theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const options: { value: Theme; Icon: React.ElementType; label: string }[] = [
    { value: 'light',  Icon: Sun,     label: 'Light'  },
    { value: 'system', Icon: Monitor, label: 'System' },
    { value: 'dark',   Icon: Moon,    label: 'Dark'   },
  ]

  return (
    <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-slate-700">
      {options.map(({ value, Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`p-1.5 transition-colors ${
            theme === value
              ? 'bg-sky-100 text-sky-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Guitar, Wrench, GripVertical, LayoutGrid, Grid3x3, LayoutList } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type View = 'lg' | 'sm' | 'list'

type GuitarItem = {
  id: string
  name: string
  brand?: string | null
  model?: string | null
  bridgePickup?: string | null
  neckPickup?: string | null
  middlePickup?: string | null
  preferredTuning?: string | null
  preferredStringGauge?: string | null
  imageUrl?: string | null
  _count: { maintenanceRecords: number }
}

function SortableGuitarCard({ guitar }: { guitar: GuitarItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: guitar.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 cursor-grab rounded-md p-1 text-gray-300 opacity-0 hover:bg-gray-100 hover:text-gray-500 group-hover:opacity-100 active:cursor-grabbing dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-400"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <Link
        href={`/guitars/${guitar.id}`}
        className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="aspect-[3/4] flex w-full items-center justify-center overflow-hidden bg-gray-100 dark:bg-slate-700">
          {guitar.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={guitar.imageUrl} alt={guitar.name} className="h-full w-full object-cover" />
          ) : (
            <Guitar className="h-12 w-12 text-gray-300 dark:text-slate-600" />
          )}
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-blue-400">{guitar.name}</h2>
          {(guitar.brand || guitar.model) && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              {[guitar.brand, guitar.model].filter(Boolean).join(' ')}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
            <Wrench className="h-3 w-3" />
            {guitar._count.maintenanceRecords} maintenance record
            {guitar._count.maintenanceRecords !== 1 ? 's' : ''}
          </div>
        </div>
      </Link>
    </div>
  )
}

function SortableGuitarListItem({ guitar }: { guitar: GuitarItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: guitar.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-2">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-gray-300 opacity-0 hover:text-gray-500 group-hover:opacity-100 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <Link
        href={`/guitars/${guitar.id}`}
        className="flex flex-1 items-center rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden dark:border-slate-700 dark:bg-slate-800"
      >
        {/* Image */}
        <div className="flex h-28 w-20 flex-shrink-0 items-center justify-center overflow-hidden bg-gray-100 dark:bg-slate-700">
          {guitar.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={guitar.imageUrl} alt={guitar.name} className="h-full w-full object-cover" />
          ) : (
            <Guitar className="h-8 w-8 text-gray-300 dark:text-slate-600" />
          )}
        </div>

        {/* Name / brand / count */}
        <div className="min-w-0 flex-1 px-4">
          <h2 className="font-semibold text-gray-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-blue-400">{guitar.name}</h2>
          {(guitar.brand || guitar.model) && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              {[guitar.brand, guitar.model].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
            <Wrench className="h-3 w-3" />
            {guitar._count.maintenanceRecords} maintenance record
            {guitar._count.maintenanceRecords !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Pickups column */}
        <div className="hidden w-64 flex-shrink-0 border-l border-gray-100 px-4 dark:border-slate-700 sm:block">
          {[
            guitar.bridgePickup && { pos: 'Bridge', val: guitar.bridgePickup },
            guitar.neckPickup   && { pos: 'Neck',   val: guitar.neckPickup },
            guitar.middlePickup && { pos: 'Middle', val: guitar.middlePickup },
          ].filter(Boolean).map((p) => (
            <p key={(p as {pos:string}).pos} className="truncate text-xs leading-5 text-gray-700 dark:text-slate-300">
              <span className="mr-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">
                {(p as {pos:string}).pos}
              </span>
              {(p as {val:string}).val}
            </p>
          ))}
        </div>

        {/* Strings / tuning column */}
        <div className="hidden w-44 flex-shrink-0 border-l border-gray-100 px-4 dark:border-slate-700 sm:block">
          {guitar.preferredStringGauge && (
            <p className="truncate text-xs leading-5 text-gray-700 dark:text-slate-300">
              <span className="mr-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Gauge</span>
              {guitar.preferredStringGauge}
            </p>
          )}
          {guitar.preferredTuning && (
            <p className="truncate text-xs leading-5 text-gray-700 dark:text-slate-300">
              <span className="mr-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">Tuning</span>
              {guitar.preferredTuning}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

export function SortableGuitarGrid({ guitars: initial }: { guitars: GuitarItem[] }) {
  const [guitars, setGuitars] = useState(initial)
  const [view, setView] = useState<View>('lg')

  useEffect(() => {
    const saved = localStorage.getItem('guitar-vault-view') as View | null
    if (saved === 'lg' || saved === 'sm' || saved === 'list') setView(saved)
  }, [])

  const changeView = (v: View) => {
    setView(v)
    localStorage.setItem('guitar-vault-view', v)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = guitars.findIndex((g) => g.id === active.id)
    const newIndex = guitars.findIndex((g) => g.id === over.id)
    const reordered = arrayMove(guitars, oldIndex, newIndex)
    setGuitars(reordered)

    await fetch('/api/guitars/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((g) => g.id) }),
    })
  }, [guitars])

  if (guitars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24 text-center text-gray-400 dark:border-slate-700 dark:text-slate-500">
        <Guitar className="mb-3 h-12 w-12" />
        <p>No guitars yet.</p>
        <Link
          href="/guitars/new"
          className="mt-4 rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
        >
          Add your first guitar
        </Link>
      </div>
    )
  }

  const btnBase = 'rounded-md p-1.5 transition-colors'
  const btnActive = 'bg-sky-100 text-sky-700 dark:bg-blue-900/60 dark:text-blue-300'
  const btnInactive = 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700'

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1">
        <button onClick={() => changeView('lg')} className={`${btnBase} ${view === 'lg' ? btnActive : btnInactive}`} title="Large grid">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button onClick={() => changeView('sm')} className={`${btnBase} ${view === 'sm' ? btnActive : btnInactive}`} title="Compact grid">
          <Grid3x3 className="h-4 w-4" />
        </button>
        <button onClick={() => changeView('list')} className={`${btnBase} ${view === 'list' ? btnActive : btnInactive}`} title="List">
          <LayoutList className="h-4 w-4" />
        </button>
      </div>

      <DndContext id="guitar-grid" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={guitars.map((g) => g.id)}
          strategy={view === 'list' ? verticalListSortingStrategy : rectSortingStrategy}
        >
          {view === 'list' ? (
            <div className="space-y-3">
              {guitars.map((guitar) => (
                <SortableGuitarListItem key={guitar.id} guitar={guitar} />
              ))}
            </div>
          ) : (
            <div className={view === 'lg'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'
            }>
              {guitars.map((guitar) => (
                <SortableGuitarCard key={guitar.id} guitar={guitar} />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}

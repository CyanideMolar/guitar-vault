'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Guitar, Wrench, GripVertical } from 'lucide-react'
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
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Guitar = {
  id: string
  name: string
  amber?: string | null
  model?: string | null
  imageUrl?: string | null
  _count: { maintenanceRecords: number }
}

function SortableGuitarCard({ guitar }: { guitar: Guitar }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: guitar.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 cursor-grab rounded-md p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <Link
        href={`/guitars/${guitar.id}`}
        className="block rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="aspect-[3/4] w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {guitar.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={guitar.imageUrl} alt={guitar.name} className="h-full w-full object-cover" />
          ) : (
            <Guitar className="h-12 w-12 text-gray-300" />
          )}
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 group-hover:text-amber-700">{guitar.name}</h2>
          {(guitar.amber || guitar.model) && (
            <p className="mt-0.5 text-sm text-gray-500">
              {[guitar.amber, guitar.model].filter(Boolean).join(' ')}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
            <Wrench className="h-3 w-3" />
            {guitar._count.maintenanceRecords} maintenance record
            {guitar._count.maintenanceRecords !== 1 ? 's' : ''}
          </div>
        </div>
      </Link>
    </div>
  )
}

export function SortableGuitarGrid({ guitars: initial }: { guitars: Guitar[] }) {
  const [guitars, setGuitars] = useState(initial)

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
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24 text-center text-gray-400">
        <Guitar className="mb-3 h-12 w-12" />
        <p>No guitars yet.</p>
        <Link
          href="/guitars/new"
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Add your first guitar
        </Link>
      </div>
    )
  }

  return (
    <DndContext id="guitar-grid" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={guitars.map((g) => g.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guitars.map((guitar) => (
            <SortableGuitarCard key={guitar.id} guitar={guitar} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

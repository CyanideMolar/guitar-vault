import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const guitars = await prisma.guitar.findMany({
    where: { ownerId: session.user.id },
    include: { customFieldValues: { include: { customField: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  const lines: string[] = [
    `# Guitar Collection — ${session.user.name ?? session.user.email}`,
    `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Total guitars: ${guitars.length}`,
    '',
    '---',
    '',
  ]

  for (const guitar of guitars) {
    lines.push(`## ${guitar.name}`)
    lines.push('')

    const fields: [string, string | null | undefined][] = [
      ['Brand', guitar.brand],
      ['Model', guitar.model],
      ['Serial Number', guitar.serialNumber],
      ['Bridge Pickup', guitar.bridgePickup],
      ['Neck Pickup', guitar.neckPickup],
      ['Middle Pickup', guitar.middlePickup],
      ['Preferred Tuning', guitar.preferredTuning],
      ['Preferred String Gauge', guitar.preferredStringGauge],
    ]

    for (const [label, value] of fields) {
      if (value) lines.push(`- **${label}:** ${value}`)
    }

    for (const cfv of guitar.customFieldValues) {
      if (cfv.value) lines.push(`- **${cfv.customField.label}:** ${cfv.value}`)
    }

    if (guitar.notes) {
      lines.push('')
      lines.push(`> ${guitar.notes}`)
    }

    lines.push('')
    lines.push('---')
    lines.push('')
  }

  const markdown = lines.join('\n')
  const filename = `guitar-collection-${new Date().toISOString().split('T')[0]}.md`

  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

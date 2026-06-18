export const MAINTENANCE_TASKS = [
  'String Change',
  'Full Setup / Action Adjustment',
  'Truss Rod Adjustment',
  'Intonation Setup',
  'Nut Replacement',
  'Fret Leveling / Crowning / Polishing',
  'Refret',
  'Pickup Installation',
  'Electronics Cleaning / Pot Replacement',
  'Bridge Adjustment',
  'Saddle Replacement',
  'Tuner Replacement',
  'Strap Button / Strap Lock Installation',
  'Cleaning & Conditioning',
  'Humidity / Storage Check',
  'Crack / Finish Repair',
  'Binding Repair',
  'Headstock Repair',
  'Professional Inspection',
  'Other',
] as const

export type MaintenanceTask = (typeof MAINTENANCE_TASKS)[number]

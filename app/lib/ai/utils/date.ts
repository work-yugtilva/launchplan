export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getWeekStartUTC(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff))
  return monday.toISOString().slice(0, 10)
}

export function formatISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

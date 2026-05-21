export function slugifyTitle(title: string, date?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, date ? 69 : 80)
  return date ? `${base}-${date}` : base
}

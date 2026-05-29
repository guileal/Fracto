/** Normaliza entrada para #rrggbb ou null se inválido */
export function normalizeHexColor(input: string): string | null {
  const s = input.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase()
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toLowerCase()}`
  return null
}

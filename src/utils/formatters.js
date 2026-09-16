const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
})

const compactFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatIDR(value) {
  return rupiahFormatter.format(Number(value) || 0).replace(/\s/g, ' ')
}

export function formatCompact(value) {
  return compactFormatter.format(Number(value) || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  return dateFormatter.format(new Date(`${value}T00:00:00+07:00`))
}

export function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

export function todayInJakarta() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function parseRupiahInput(value) {
  const input = String(value).trim()
  if (!input) return ''
  if (!/^\d+$/.test(input) && !/^\d{1,3}(?:\.\d{3})+$/.test(input)) return null
  const digits = input.replaceAll('.', '')
  const amount = Number(digits)
  if (!Number.isSafeInteger(amount)) return null
  return amount
}

export function formatRupiahInput(value) {
  if (value === '' || value === null || value === undefined) return ''
  return new Intl.NumberFormat('id-ID').format(Number(value))
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'CM'
}

export function isDeleted(value) {
  if (!value) return false
  if (typeof value === 'object' && 'Valid' in value) return Boolean(value.Valid)
  return true
}

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

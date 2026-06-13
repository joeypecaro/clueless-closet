import type { ItemCategory } from '../types/database'

export const CATEGORY_META: Array<{ value: ItemCategory; label: string; emoji: string }> = [
  { value: 'top', label: 'Top', emoji: '👚' },
  { value: 'bottom', label: 'Bottom', emoji: '👖' },
  { value: 'dress', label: 'Dress', emoji: '👗' },
  { value: 'shoes', label: 'Shoes', emoji: '👠' },
  { value: 'purse', label: 'Purse', emoji: '👜' },
  { value: 'accessory', label: 'Accessory', emoji: '💍' },
]

export const COLOR_OPTIONS: Array<{ value: string; label: string; hex: string; border?: boolean }> = [
  { value: 'black', label: 'Black', hex: '#1C1C1E' },
  { value: 'white', label: 'White', hex: '#F2F2EF', border: true },
  { value: 'grey', label: 'Grey', hex: '#8E8E93' },
  { value: 'beige', label: 'Beige', hex: '#C8B49A' },
  { value: 'navy', label: 'Navy', hex: '#1B2A4A' },
  { value: 'brown', label: 'Brown', hex: '#6B4226' },
  { value: 'red', label: 'Red', hex: '#FF3B30' },
  { value: 'pink', label: 'Pink', hex: '#FF6B8A' },
  { value: 'orange', label: 'Orange', hex: '#FF9F0A' },
  { value: 'yellow', label: 'Yellow', hex: '#F5C400' },
  { value: 'green', label: 'Green', hex: '#34C759' },
  { value: 'blue', label: 'Blue', hex: '#007AFF' },
  { value: 'purple', label: 'Purple', hex: '#AF52DE' },
  { value: 'denim', label: 'Denim', hex: '#4A7FA5' },
]

export const COLOR_HEX: Record<string, string> = Object.fromEntries(
  COLOR_OPTIONS.map((c) => [c.value, c.hex]),
)

export const STYLE_TAG_OPTIONS = [
  'casual', 'preppy', 'going-out', 'vintage', 'sporty',
  'boho', 'formal', 'streetwear', 'Y2K', 'minimalist', 'coastal', 'romantic',
].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))

export const SEASON_OPTIONS = [
  { value: 'spring', label: 'Spring 🌸' },
  { value: 'summer', label: 'Summer ☀️' },
  { value: 'fall', label: 'Fall 🍂' },
  { value: 'winter', label: 'Winter ❄️' },
]

export const OCCASION_OPTIONS = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'school', label: 'School' },
  { value: 'work', label: 'Work' },
  { value: 'date', label: 'Date' },
  { value: 'party', label: 'Party' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'most-worn', label: 'Most worn' },
  { value: 'least-worn', label: 'Least worn' },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']

export function currentSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

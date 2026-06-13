import type { Item, ItemCategory } from '../types/database'

export interface GeneratedOutfit {
  path: 'dress' | 'tops-bottoms'
  dress: Item | null
  top: Item | null
  bottom: Item | null
  shoes: Item
  purse: Item | null
  accessory: Item | null
}

export type LockedSlots = Partial<Record<ItemCategory, Item | null>>

// Colors that pair well with anything
const NEUTRALS = new Set(['black', 'white', 'grey', 'beige', 'denim', 'brown', 'navy'])

function colorScore(items: Item[]): number {
  const allColors = items.flatMap((i) => i.colors)
  const accents = allColors.filter((c) => !NEUTRALS.has(c))
  const uniqueAccents = new Set(accents)

  let score = 0
  if (uniqueAccents.size === 0) score += 3      // all neutrals — foolproof
  else if (uniqueAccents.size <= 2) score += 1  // max 2 accent colors — tasteful
  // > 2 accent families: neutral score (no penalty, just no bonus)

  // Bonus: any two items share at least one color
  const sets = items.map((i) => new Set(i.colors))
  outer: for (let a = 0; a < sets.length; a++) {
    for (let b = a + 1; b < sets.length; b++) {
      if ([...sets[a]].some((c) => sets[b].has(c))) {
        score += 2
        break outer
      }
    }
  }

  return score
}

function pick<T>(arr: T[]): T | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null
}

function key(items: Array<Item | null>): string {
  return items
    .filter(Boolean)
    .map((i) => i!.id)
    .sort()
    .join(',')
}

export function generateOutfit(
  allItems: Item[],
  occasion: string,
  season: string,
  locked: LockedSlots,
  history: string[], // array of outfit keys from last 3 generations
): GeneratedOutfit | null {
  const owned = allItems.filter((i) => !i.is_wishlist)

  // Try filtered pool first; fall back to all owned if too sparse
  const filtered = owned.filter(
    (i) =>
      (i.occasions.length === 0 || i.occasions.includes(occasion)) &&
      (i.seasons.length === 0 || i.seasons.includes(season)),
  )
  const pool = filtered.length >= 2 ? filtered : owned

  const by = (cat: ItemCategory) => pool.filter((i) => i.category === cat)
  const dresses = by('dress')
  const tops = by('top')
  const bottoms = by('bottom')
  const shoes = by('shoes')
  const purses = by('purse')
  const accs = by('accessory')

  // A valid outfit needs shoes and (dress OR top+bottom)
  if (!locked.shoes && shoes.length === 0) return null

  let path: 'dress' | 'tops-bottoms'
  if (locked.dress) path = 'dress'
  else if (locked.top || locked.bottom) path = 'tops-bottoms'
  else if (dresses.length > 0 && tops.length > 0 && bottoms.length > 0)
    path = Math.random() < 0.35 ? 'dress' : 'tops-bottoms'
  else if (dresses.length > 0) path = 'dress'
  else if (tops.length > 0 && bottoms.length > 0) path = 'tops-bottoms'
  else return null

  interface Candidate { outfit: GeneratedOutfit; score: number }
  const candidates: Candidate[] = []

  for (let i = 0; i < 18; i++) {
    const shoesItem = locked.shoes !== undefined ? (locked.shoes as Item) : pick(shoes)
    if (!shoesItem) continue

    let dress: Item | null = null
    let top: Item | null = null
    let bottom: Item | null = null

    if (path === 'dress') {
      dress = locked.dress !== undefined ? (locked.dress as Item) : pick(dresses)
      if (!dress) continue
    } else {
      top = locked.top !== undefined ? (locked.top as Item) : pick(tops)
      bottom = locked.bottom !== undefined ? (locked.bottom as Item) : pick(bottoms)
      if (!top || !bottom) continue
    }

    // Optional slots: use locked value (even null means "exclude"), else random
    const purse =
      'purse' in locked
        ? (locked.purse as Item | null)
        : purses.length > 0 && Math.random() < 0.65
          ? pick(purses)
          : null

    const accessory =
      'accessory' in locked
        ? (locked.accessory as Item | null)
        : accs.length > 0 && Math.random() < 0.45
          ? pick(accs)
          : null

    const outfit: GeneratedOutfit = { path, dress, top, bottom, shoes: shoesItem, purse, accessory }
    const items = [dress, top, bottom, shoesItem, purse, accessory].filter(Boolean) as Item[]
    const outfitKey = key([dress, top, bottom, shoesItem, purse, accessory])
    const inHistory = history.includes(outfitKey)

    candidates.push({ outfit, score: colorScore(items) - (inHistory ? 50 : 0) })
  }

  if (!candidates.length) return null

  candidates.sort((a, b) => b.score - a.score)
  const top3 = candidates.slice(0, Math.min(3, candidates.length))
  return top3[Math.floor(Math.random() * top3.length)].outfit
}

export function outfitItemIds(outfit: GeneratedOutfit): string[] {
  return [outfit.dress, outfit.top, outfit.bottom, outfit.shoes, outfit.purse, outfit.accessory]
    .filter(Boolean)
    .map((i) => i!.id)
}

export function outfitHistoryKey(outfit: GeneratedOutfit): string {
  return outfitItemIds(outfit).sort().join(',')
}

export function hasSufficientItems(items: Item[]): boolean {
  const owned = items.filter((i) => !i.is_wishlist)
  const hasShoes = owned.some((i) => i.category === 'shoes')
  const hasTop = owned.some((i) => i.category === 'top')
  const hasBottom = owned.some((i) => i.category === 'bottom')
  const hasDress = owned.some((i) => i.category === 'dress')
  return hasShoes && (hasDress || (hasTop && hasBottom))
}

export function autoName(occasion: string): string {
  const words = ['Fab', 'Cute', 'Iconic', 'Chic', 'Fresh', 'Classic', 'Major', 'Preppy', 'Fly']
  const word = words[Math.floor(Math.random() * words.length)]
  const occ = occasion.charAt(0).toUpperCase() + occasion.slice(1)
  return `${word} ${occ} Look`
}

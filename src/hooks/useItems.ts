import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { compressImage } from '../lib/compressImage'
import type { Item, ItemCategory } from '../types/database'

export interface NewItemData {
  category: ItemCategory
  name: string
  colors: string[]
  style_tags: string[]
  seasons: string[]
  occasions: string[]
  brand: string
  is_wishlist: boolean
  wishlist_link: string
}

type ItemUpdate = Partial<NewItemData & { wear_count: number }>

export function useItems() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setItems(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = useCallback(
    async (
      data: NewItemData,
      photoFile: File,
    ): Promise<{ error: Error | null }> => {
      if (!user) return { error: new Error('Not signed in') }
      try {
        const compressed = await compressImage(photoFile, 1200, 0.85)
        const path = `${user.id}/${crypto.randomUUID()}.jpg`

        const { error: uploadErr } = await supabase.storage
          .from('item-photos')
          .upload(path, compressed, { contentType: 'image/jpeg' })
        if (uploadErr) return { error: uploadErr }

        // Store path — public URL computed at display time
        const { data: inserted, error: insertErr } = await supabase
          .from('items')
          .insert({ user_id: user.id, ...data, photo_url: path })
          .select()
          .single()
        if (insertErr) return { error: insertErr }

        setItems((prev) => [inserted, ...prev])
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Failed to add item') }
      }
    },
    [user],
  )

  const updateItem = useCallback(
    async (id: string, updates: ItemUpdate): Promise<{ error: Error | null }> => {
      const { error: err } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
      if (!err)
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        )
      return { error: err ?? null }
    },
    [],
  )

  const deleteItem = useCallback(
    async (id: string): Promise<{ error: Error | null }> => {
      const item = items.find((i) => i.id === id)
      const { error: err } = await supabase.from('items').delete().eq('id', id)
      if (!err) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        if (item?.photo_url) {
          await supabase.storage.from('item-photos').remove([item.photo_url])
        }
      }
      return { error: err ?? null }
    },
    [items],
  )

  const toggleWishlist = useCallback(
    (id: string, isWishlist: boolean) =>
      updateItem(id, { is_wishlist: isWishlist }),
    [updateItem],
  )

  const incrementWearCount = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      if (!item) return Promise.resolve({ error: null })
      return updateItem(id, { wear_count: item.wear_count + 1 })
    },
    [items, updateItem],
  )

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleWishlist,
    incrementWearCount,
    refresh: fetchItems,
  }
}

// Public URL helper — requires item-photos bucket to be set to public in Supabase
export function getItemPhotoUrl(path: string): string {
  const { data } = supabase.storage.from('item-photos').getPublicUrl(path)
  return data.publicUrl
}

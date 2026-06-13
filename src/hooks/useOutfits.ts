import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Outfit } from '../types/database'

export function useOutfits() {
  const { user } = useAuth()

  const saveOutfit = useCallback(
    async (
      itemIds: string[],
      name: string,
      occasion: string,
    ): Promise<{ data: Outfit | null; error: Error | null }> => {
      if (!user) return { data: null, error: new Error('Not signed in') }
      const { data, error } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          item_ids: itemIds,
          name,
          occasion,
          source: 'generated',
        })
        .select()
        .single()
      return { data: data ?? null, error: error ?? null }
    },
    [user],
  )

  const addToCalendar = useCallback(
    async (
      outfitId: string,
      date: string,
      status: 'planned' | 'worn' = 'worn',
    ): Promise<{ error: Error | null }> => {
      if (!user) return { error: new Error('Not signed in') }
      const { error } = await supabase.from('outfit_calendar').upsert(
        { user_id: user.id, outfit_id: outfitId, date, status },
        { onConflict: 'user_id,date' },
      )
      return { error: error ?? null }
    },
    [user],
  )

  return { saveOutfit, addToCalendar }
}

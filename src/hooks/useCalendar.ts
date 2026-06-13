import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Outfit, OutfitCalendarEntry } from '../types/database'

export interface CalendarEntryWithOutfit extends Omit<OutfitCalendarEntry, 'status'> {
  outfit: Outfit
  status: 'planned' | 'worn'
}

export function useCalendar(year: number, month: number) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<CalendarEntryWithOutfit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const pad = (n: number) => String(n).padStart(2, '0')
    const from = `${year}-${pad(month + 1)}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${pad(month + 1)}-${pad(lastDay)}`

    const { data: calData } = await supabase
      .from('outfit_calendar')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)
      .order('date')

    if (!calData || calData.length === 0) {
      setEntries([])
      setLoading(false)
      return
    }

    const outfitIds = [...new Set(calData.map((e) => e.outfit_id))]
    const { data: outfitData } = await supabase
      .from('outfits')
      .select('*')
      .in('id', outfitIds)

    const outfitsMap = new Map((outfitData ?? []).map((o) => [o.id, o]))
    const merged = calData
      .map((entry) => {
        const outfit = outfitsMap.get(entry.outfit_id)
        if (!outfit) return null
        return {
          ...entry,
          outfit,
          status: (entry.status === 'worn' ? 'worn' : 'planned') as 'planned' | 'worn',
        }
      })
      .filter(Boolean) as CalendarEntryWithOutfit[]

    setEntries(merged)
    setLoading(false)
  }, [user, year, month])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const planForDate = useCallback(
    async (date: string, outfitId: string, status: 'planned' | 'worn' = 'planned') => {
      if (!user) return { error: new Error('Not signed in') }
      const { error } = await supabase.from('outfit_calendar').upsert(
        { user_id: user.id, outfit_id: outfitId, date, status },
        { onConflict: 'user_id,date' },
      )
      if (!error) await fetchEntries()
      return { error: error ?? null }
    },
    [user, fetchEntries],
  )

  const removeEntry = useCallback(
    async (entryId: string) => {
      const { error } = await supabase.from('outfit_calendar').delete().eq('id', entryId)
      if (!error) await fetchEntries()
      return { error: error ?? null }
    },
    [fetchEntries],
  )

  const updateStatus = useCallback(
    async (entryId: string, status: 'planned' | 'worn') => {
      const { error } = await supabase
        .from('outfit_calendar')
        .update({ status })
        .eq('id', entryId)
      if (!error) await fetchEntries()
      return { error: error ?? null }
    },
    [fetchEntries],
  )

  return { entries, loading, planForDate, removeEntry, updateStatus, refresh: fetchEntries }
}

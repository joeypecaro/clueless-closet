export type ItemCategory = 'top' | 'bottom' | 'dress' | 'shoes' | 'purse' | 'accessory'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          location_city: string | null
          style_preferences: Record<string, unknown>
          sizes: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          location_city?: string | null
          style_preferences?: Record<string, unknown>
          sizes?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          location_city?: string | null
          style_preferences?: Record<string, unknown>
          sizes?: Record<string, unknown>
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          category: ItemCategory
          name: string
          photo_url: string
          colors: string[]
          style_tags: string[]
          seasons: string[]
          occasions: string[]
          brand: string | null
          is_wishlist: boolean
          wishlist_link: string | null
          wear_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: ItemCategory
          name: string
          photo_url: string
          colors?: string[]
          style_tags?: string[]
          seasons?: string[]
          occasions?: string[]
          brand?: string | null
          is_wishlist?: boolean
          wishlist_link?: string | null
          wear_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: ItemCategory
          name?: string
          photo_url?: string
          colors?: string[]
          style_tags?: string[]
          seasons?: string[]
          occasions?: string[]
          brand?: string | null
          is_wishlist?: boolean
          wishlist_link?: string | null
          wear_count?: number
          created_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string | null
          item_ids: string[]
          occasion: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          item_ids: string[]
          occasion?: string | null
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          item_ids?: string[]
          occasion?: string | null
          source?: string
          created_at?: string
        }
      }
      outfit_calendar: {
        Row: {
          id: string
          user_id: string
          outfit_id: string
          date: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          outfit_id: string
          date: string
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          outfit_id?: string
          date?: string
          status?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      item_category: ItemCategory
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Outfit = Database['public']['Tables']['outfits']['Row']
export type OutfitCalendarEntry = Database['public']['Tables']['outfit_calendar']['Row']

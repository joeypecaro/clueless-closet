import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/compressImage'
import type { Profile } from '../types/database'

interface StylePreferences {
  dionneModeEnabled?: boolean
  favoriteColors?: string[]
  avoid?: string
}

interface Sizes {
  top?: string
  bottom?: string
  dress?: string
  shoe?: string
}

interface ProfileUpdates {
  display_name?: string
  location_city?: string
  style_preferences?: StylePreferences
  sizes?: Sizes
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  avatarUrl: string | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdates) => Promise<{ error: Error | null }>
  uploadAvatar: (file: File) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return

    setProfile(data)

    if (data.avatar_url) {
      const { data: signedData } = await supabase.storage
        .from('avatars')
        .createSignedUrl(data.avatar_url, 3600)
      setAvatarUrl(signedData?.signedUrl ?? null)
    } else {
      setAvatarUrl(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setAvatarUrl(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    },
    [],
  )

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })
      if (error) return { error, needsConfirmation: false }
      const needsConfirmation = !data.session
      return { error: null, needsConfirmation }
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const updateProfile = useCallback(
    async (updates: ProfileUpdates): Promise<{ error: Error | null }> => {
      if (!user) return { error: new Error('Not signed in') }

      const mergedPrefs = {
        ...(profile?.style_preferences ?? {}),
        ...(updates.style_preferences ?? {}),
      }
      const mergedSizes = {
        ...(profile?.sizes ?? {}),
        ...(updates.sizes ?? {}),
      }

      const payload = {
        ...(updates.display_name !== undefined && { display_name: updates.display_name }),
        ...(updates.location_city !== undefined && { location_city: updates.location_city }),
        style_preferences: mergedPrefs,
        sizes: mergedSizes,
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)

      if (!error) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...payload,
                style_preferences: mergedPrefs as Record<string, unknown>,
                sizes: mergedSizes as Record<string, unknown>,
              }
            : prev,
        )
      }

      return { error: error ?? null }
    },
    [user, profile],
  )

  const uploadAvatar = useCallback(
    async (file: File): Promise<{ error: Error | null }> => {
      if (!user) return { error: new Error('Not signed in') }

      try {
        const compressed = await compressImage(file, 400, 0.88)
        const path = `${user.id}/avatar.jpg`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, compressed, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (uploadError) return { error: uploadError }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: path })
          .eq('id', user.id)

        if (updateError) return { error: updateError }

        setProfile((prev) => (prev ? { ...prev, avatar_url: path } : prev))

        const { data: signedData } = await supabase.storage
          .from('avatars')
          .createSignedUrl(path, 3600)
        setAvatarUrl(signedData?.signedUrl ?? null)

        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Upload failed') }
      }
    },
    [user],
  )

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        avatarUrl,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        uploadAvatar,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

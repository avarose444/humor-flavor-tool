'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from './supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from './database.types'

interface AuthCtx {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  session: null, user: null, profile: null,
  loading: true, isAdmin: false, signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [session, setSession]   = useState<Session | null>(null)
  const [user,    setUser]      = useState<User | null>(null)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session); setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null) }
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Ctx.Provider value={{
      session, user, profile, loading,
      isAdmin: !!(profile?.is_superadmin || profile?.is_matrix_admin),
      signOut: () => supabase.auth.signOut().then(() => {}),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)

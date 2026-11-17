import { supabase } from '@/lib/supabase'
import { toAppError } from '@/utils/errors'
import type { AuthUser } from '@/types/auth'
import type { User } from '@supabase/supabase-js'

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
  }
}

export const authService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw toAppError(error, 'Impossible de récupérer la session')

    return data.session?.user ? toAuthUser(data.session.user) : null
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toAuthUser(session.user) : null)
    })

    return () => subscription.unsubscribe()
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) throw toAppError(error, 'Impossible de se connecter avec Google.')
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) throw toAppError(error, 'Impossible de se déconnecter.')
  }
}
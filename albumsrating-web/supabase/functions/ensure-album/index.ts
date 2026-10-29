import { createClient } from '@supabase/supabase-js'
import { corsHeaders, json } from '../_shared/http.ts'
import { SpotifyError } from '../_shared/spotify.ts'
import { ensureAlbumInCatalog } from '../_shared/catalog.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    
  const url = Deno.env.get('SUPABASE_URL')!
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const { spotifyId } = await req.json().catch(() => ({}))
  if (typeof spotifyId !== 'string' || !/^[A-Za-z0-9]{22}$/.test(spotifyId)) {
    return json({ error: 'Invalid album id' }, 400)
  }

  try {
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const albumId = await ensureAlbumInCatalog(admin, spotifyId)
    return json({ albumId })
  } catch (e) {
    if (e instanceof SpotifyError && (e.status === 404 || e.status === 400)) {
      return json({ error: 'Not found' }, 404)
    }
    console.error(e)
    return json({ error: 'Internal error' }, 500)
  }
})
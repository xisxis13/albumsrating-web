import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Le jeton Spotify est gardé en mémoire tant qu'il est valide
let cachedToken: { value: string; expiresAt: number } | null = null

async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value

  const id = Deno.env.get('SPOTIFY_CLIENT_ID')!
  const secret = Deno.env.get('SPOTIFY_CLIENT_SECRET')!

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`)

  const data = await res.json()
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return cachedToken.value
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // 1. Vérifier que l'appelant est un utilisateur connecté
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  // 2. Lire et valider la requête
  const { q, offset = 0 } = await req.json().catch(() => ({}))
  if (typeof q !== 'string' || q.trim() === '') return json({ error: 'Missing query' }, 400)

  // 3. Appeler Spotify (limit=10 : maximum autorisé depuis février 2026)
  try {
    const token = await getSpotifyToken()
    const params = new URLSearchParams({
      q: q.trim(),
      type: 'album',
      limit: '10',
      offset: String(Math.max(0, Number(offset) || 0)),
    })
    const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return json({ error: `Spotify error ${res.status}` }, 502)

    const data = await res.json()
    const items = (data.albums?.items ?? []).filter(Boolean).map((a: any) => ({
      spotifyId: a.id,
      title: a.name,
      artists: a.artists.map((x: any) => ({ spotifyId: x.id, name: x.name })),
      coverUrl: a.images?.[0]?.url ?? null,
      releaseDate: a.release_date,
      albumType: a.album_type,
      totalTracks: a.total_tracks,
    }))

    return json({ items, total: data.albums?.total ?? 0, offset: Number(offset) || 0 })
  } catch (e) {
    console.error(e)
    return json({ error: 'Internal error' }, 500)
  }
})
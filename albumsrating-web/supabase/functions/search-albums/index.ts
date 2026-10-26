import { createClient } from '@supabase/supabase-js'
import { corsHeaders, json } from '../_shared/http.ts'
import { spotifyGet } from '../_shared/spotify.ts'

interface SpotifyArtist {
  id: string
  name: string
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: SpotifyArtist[]
  images?: { url: string }[]
  release_date: string
  album_type: string
  total_tracks: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const { q, offset = 0 } = await req.json().catch(() => ({}))
  if (typeof q !== 'string' || q.trim() === '') return json({ error: 'Missing query' }, 400)

  try {
    const params = new URLSearchParams({
      q: q.trim(),
      type: 'album',
      limit: '10',
      offset: String(Math.max(0, Number(offset) || 0)),
    })
    const data = await spotifyGet<{
      albums?: { items: (SpotifyAlbum | null)[]; total: number }
    }>(`/search?${params}`)

    const items = (data.albums?.items ?? [])
      .filter((a): a is SpotifyAlbum => a !== null)
      .map((a) => ({
        spotifyId: a.id,
        title: a.name,
        artists: a.artists.map((x) => ({ spotifyId: x.id, name: x.name })),
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
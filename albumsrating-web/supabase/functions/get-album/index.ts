import { createClient } from '@supabase/supabase-js'
import { corsHeaders, json } from '../_shared/http.ts'
import { fetchFullAlbum, mapAlbumType, SpotifyError } from '../_shared/spotify.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const { spotifyId } = await req.json().catch(() => ({}))
  if (typeof spotifyId !== 'string' || !/^[A-Za-z0-9]{22}$/.test(spotifyId)) {
    return json({ error: 'Invalid album id' }, 400)
  }

  try {
    const { album, tracks } = await fetchFullAlbum(spotifyId)

    return json({
      spotifyId: album.id,
      title: album.name,
      coverUrl: album.images?.[0]?.url ?? null,
      releaseYear: parseInt(album.release_date.slice(0, 4), 10),
      albumType: mapAlbumType(album.album_type),
      artists: album.artists.map((a) => a.name),
      tracks: tracks.map((t) => ({
        spotifyId: t.id,
        title: t.name,
        trackNumber: t.track_number,
        discNumber: t.disc_number,
        durationMs: t.duration_ms,
      })),
    })
  } catch (e) {
    if (e instanceof SpotifyError && (e.status === 404 || e.status === 400)) {
      return json({ error: 'Not found' }, 404)
    }
    console.error(e)
    return json({ error: 'Internal error' }, 500)
  }
})
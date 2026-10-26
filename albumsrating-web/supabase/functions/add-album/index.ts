import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { corsHeaders, json } from '../_shared/http.ts'
import { fetchFullAlbum, mapAlbumType } from '../_shared/spotify.ts'

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

function required<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  const data = check(result)
  if (data === null || data === undefined) throw new Error('Empty result')
  return data as NonNullable<T>
}

async function ensureAlbumInCatalog(admin: SupabaseClient, spotifyId: string): Promise<string> {
  const existing = check(
    await admin.from('album').select('id').eq('spotify_id', spotifyId).maybeSingle(),
  )
  if (existing) {
    const { count } = await admin
      .from('track')
      .select('id', { count: 'exact', head: true })
      .eq('album_id', existing.id)
    if ((count ?? 0) > 0) return existing.id
  }

  const { album, tracks } = await fetchFullAlbum(spotifyId)

  const artistNames = new Map<string, string>()
  for (const a of [...album.artists, ...tracks.flatMap((t) => t.artists)]) {
    artistNames.set(a.id, a.name)
  }
  const artistRows = required(
    await admin
      .from('artist')
      .upsert(
        [...artistNames].map(([spotify_id, name]) => ({ spotify_id, name })),
        { onConflict: 'spotify_id' },
      )
      .select('id, spotify_id'),
  )
  const artistIds = new Map<string, string>(artistRows.map((r) => [r.spotify_id, r.id]))

  const albumRow = required(
    await admin
      .from('album')
      .upsert(
        {
          spotify_id: album.id,
          title: album.name,
          cover_url: album.images?.[0]?.url ?? null,
          release_year: parseInt(album.release_date.slice(0, 4), 10),
          album_type: mapAlbumType(album.album_type),
        },
        { onConflict: 'spotify_id' },
      )
      .select('id')
      .single(),
  )

  check(
    await admin.from('album_artist').upsert(
      album.artists.map((a) => ({ album_id: albumRow.id, artist_id: artistIds.get(a.id)! })),
      { onConflict: 'album_id,artist_id', ignoreDuplicates: true },
    ),
  )

  const trackRows = required(
    await admin
      .from('track')
      .upsert(
        tracks.map((t) => ({
          spotify_id: t.id,
          album_id: albumRow.id,
          title: t.name,
          track_number: t.track_number,
          disc_number: t.disc_number,
          duration_ms: t.duration_ms,
        })),
        { onConflict: 'spotify_id' },
      )
      .select('id, spotify_id'),
  )
  const trackIds = new Map<string, string>(trackRows.map((r) => [r.spotify_id, r.id]))

  check(
    await admin.from('track_artist').upsert(
      tracks.flatMap((t) =>
        t.artists.map((a) => ({
          track_id: trackIds.get(t.id)!,
          artist_id: artistIds.get(a.id)!,
        })),
      ),
      { onConflict: 'track_id,artist_id', ignoreDuplicates: true },
    ),
  )

  return albumRow.id
}

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

    check(
      await userClient.from('album_review').upsert(
        { user_id: user.id, album_id: albumId },
        { onConflict: 'user_id,album_id', ignoreDuplicates: true },
      ),
    )

    return json({ albumId })
  } catch (e) {
    console.error(e)
    return json({ error: 'Internal error' }, 500)
  }
})
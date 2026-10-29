import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchFullAlbum, mapAlbumType } from './spotify.ts'

export function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

function required<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  const data = check(result)
  if (data === null || data === undefined) throw new Error('Empty result')
  return data as NonNullable<T>
}

export async function ensureAlbumInCatalog(
  admin: SupabaseClient,
  spotifyId: string,
): Promise<string> {
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
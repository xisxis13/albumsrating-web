export interface SpotifyArtist {
  id: string
  name: string
}

export interface SpotifyTrack {
  id: string
  name: string
  track_number: number
  disc_number: number
  duration_ms: number
  artists: SpotifyArtist[]
}

export interface SpotifyFullAlbum {
  id: string
  name: string
  album_type: string
  release_date: string
  images?: { url: string }[]
  artists: SpotifyArtist[]
  tracks: { items: SpotifyTrack[]; total: number }
}

export class SpotifyError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

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

export async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getSpotifyToken()
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new SpotifyError(res.status, `Spotify error ${res.status} on ${path}`)
  return (await res.json()) as T
}

export async function fetchFullAlbum(spotifyId: string) {
  const album = await spotifyGet<SpotifyFullAlbum>(`/albums/${spotifyId}`)
  const tracks = [...album.tracks.items]

  while (tracks.length < album.tracks.total) {
    const page = await spotifyGet<{ items: SpotifyTrack[] }>(
      `/albums/${spotifyId}/tracks?limit=50&offset=${tracks.length}`,
    )
    if (page.items.length === 0) break
    tracks.push(...page.items)
  }

  return { album, tracks }
}

export function mapAlbumType(type: string): string {
  return ['album', 'single', 'compilation'].includes(type) ? type : 'album'
}
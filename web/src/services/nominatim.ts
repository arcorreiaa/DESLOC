import type { LatLng } from '../types'

const USER_AGENT = 'DESLOC-ESUDA-MLOps/1.0'

type NominatimSearchHit = {
  lat: string
  lon: string
  display_name: string
}

type NominatimReverseHit = {
  display_name: string
  address?: {
    road?: string
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    village?: string
    state?: string
  }
}

function headers(): HeadersInit {
  return { Accept: 'application/json', 'User-Agent': USER_AGENT }
}

export function formatShortLabel(hit: NominatimReverseHit): string {
  const a = hit.address
  if (a) {
    const street = a.road ?? ''
    const area = a.suburb ?? a.neighbourhood ?? ''
    const city = a.city ?? a.town ?? a.village ?? ''
    const parts = [street, area, city].filter(Boolean)
    if (parts.length) return parts.join(', ')
  }
  const parts = hit.display_name.split(',').map((s) => s.trim())
  return parts.slice(0, 3).join(', ')
}

export async function searchAddress(query: string): Promise<{ position: LatLng; label: string } | null> {
  const q = query.trim()
  if (q.length < 3) return null

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '1')

  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) return null

  const hits = (await res.json()) as NominatimSearchHit[]
  const hit = hits[0]
  if (!hit) return null

  return {
    position: { lat: Number(hit.lat), lng: Number(hit.lon) },
    label: hit.display_name.split(',').slice(0, 3).join(', ').trim(),
  }
}

export async function reverseAddress(lat: number, lng: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')

  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`

  const hit = (await res.json()) as NominatimReverseHit
  return formatShortLabel(hit)
}

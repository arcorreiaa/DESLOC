import { useEffect, useState } from 'react'
import type { LatLng } from '../types'

export const RECIFE_MARCO_ZERO: LatLng = { lat: -8.063164, lng: -34.871176 }

export type MapBootstrap = {
  ready: boolean
  mapCenter: LatLng
  initialZoom: number
  userPosition: LatLng | null
  gpsDenied: boolean
}

export function useMapBootstrap(): MapBootstrap {
  const [ready, setReady] = useState(false)
  const [mapCenter, setMapCenter] = useState<LatLng>(RECIFE_MARCO_ZERO)
  const [initialZoom, setInitialZoom] = useState(13)
  const [userPosition, setUserPosition] = useState<LatLng | null>(null)
  const [gpsDenied, setGpsDenied] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsDenied(true)
      setReady(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPosition(p)
        setMapCenter(p)
        setInitialZoom(15)
        setGpsDenied(false)
        setReady(true)
      },
      () => {
        setMapCenter(RECIFE_MARCO_ZERO)
        setInitialZoom(13)
        setGpsDenied(true)
        setReady(true)
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }, [])

  useEffect(() => {
    if (!navigator.geolocation || !ready) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30_000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [ready])

  return { ready, mapCenter, initialZoom, userPosition, gpsDenied }
}

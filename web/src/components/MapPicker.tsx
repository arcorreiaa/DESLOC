import { useEffect } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from '../types'
import { destPinIcon, originPinIcon, userPinIcon } from './mapPins'
import 'leaflet/dist/leaflet.css'

function InitialView({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom)
  }, [map, center.lat, center.lng, zoom])
  return null
}

function FitBounds({ origin, destination }: { origin: LatLng; destination: LatLng }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds(
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    )
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 })
  }, [map, origin.lat, origin.lng, destination.lat, destination.lng])
  return null
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

type Props = {
  ready: boolean
  mapCenter: LatLng
  initialZoom: number
  origin: LatLng | null
  destination: LatLng | null
  userPosition: LatLng | null
  onPick: (p: LatLng) => void
}

export function MapPicker({
  ready,
  mapCenter,
  initialZoom,
  origin,
  destination,
  userPosition,
  onPick,
}: Props) {
  if (!ready) {
    return (
      <div className="map-wrap map-wrap--loading">
        <p className="map-loading">Localizando…</p>
      </div>
    )
  }

  const line =
    origin && destination
      ? ([[origin.lat, origin.lng], [destination.lat, destination.lng]] as [number, number][])
      : []

  return (
    <div className="map-wrap">
      <MapContainer center={mapCenter} zoom={initialZoom} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InitialView center={mapCenter} zoom={initialZoom} />
        {origin && destination && <FitBounds origin={origin} destination={destination} />}
        <ClickHandler onPick={onPick} />
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userPinIcon} zIndexOffset={1000} />
            <Circle
              center={userPosition}
              radius={45}
              pathOptions={{
                color: '#5dffc8',
                fillColor: '#5dffc8',
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
          </>
        )}
        {origin && <Marker position={origin} icon={originPinIcon} />}
        {destination && <Marker position={destination} icon={destPinIcon} />}
        {line.length === 2 && (
          <Polyline
            positions={line}
            pathOptions={{ color: '#5dffc8', weight: 5, opacity: 0.9, lineCap: 'round' }}
          />
        )}
      </MapContainer>
    </div>
  )
}

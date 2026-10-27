import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DeslocLogo } from './components/DeslocLogo'
import { MapPicker } from './components/MapPicker'
import { RouteSearch } from './components/RouteSearch'
import { TripSummary } from './components/TripSummary'
import { useMapBootstrap } from './hooks/useMapBootstrap'
import { reverseAddress, searchAddress } from './services/nominatim'
import type { EstimativaCorridaResponse } from './types/api'
import type { LatLng } from './types'
import { haversineKm } from './utils/geo'
import './App.css'

type ActiveField = 'origin' | 'destination'

async function fetchPrediction(
  origin: LatLng,
  destination: LatLng,
): Promise<EstimativaCorridaResponse> {
  const res = await fetch('/api/v1/estimativa-corrida', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pickup_lat: origin.lat,
      pickup_lon: origin.lng,
      dropoff_lat: destination.lat,
      dropoff_lon: destination.lng,
      embarque_em: new Date().toISOString(),
    }),
  })
  const text = await res.text()
  if (!res.ok) {
    let message = text || `Erro ${res.status}`
    try {
      const err = JSON.parse(text) as { error?: string }
      if (err.error) message = err.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return JSON.parse(text) as EstimativaCorridaResponse
}

function App() {
  const { ready, mapCenter, initialZoom, userPosition, gpsDenied } = useMapBootstrap()

  const [activeField, setActiveField] = useState<ActiveField>('origin')
  const [origin, setOrigin] = useState<LatLng | null>(null)
  const [destination, setDestination] = useState<LatLng | null>(null)
  const [originLabel, setOriginLabel] = useState('')
  const [destinationLabel, setDestinationLabel] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EstimativaCorridaResponse | null>(null)

  const canEstimate = Boolean(origin && destination)
  const autoOriginDone = useRef(false)

  const applyPosition = useCallback(
    async (field: ActiveField, pos: LatLng) => {
      if (field === 'origin') {
        setOrigin(pos)
        setActiveField('destination')
      } else {
        setDestination(pos)
      }
      setResult(null)
      setError(null)
      setSearchError(null)
      try {
        const label = await reverseAddress(pos.lat, pos.lng)
        if (field === 'origin') setOriginLabel(label)
        else setDestinationLabel(label)
      } catch {
        const fallback = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`
        if (field === 'origin') setOriginLabel(fallback)
        else setDestinationLabel(fallback)
      }
    },
    [],
  )

  useEffect(() => {
    if (!ready || gpsDenied || !userPosition || autoOriginDone.current || origin) return
    autoOriginDone.current = true
    void applyPosition('origin', userPosition)
  }, [ready, gpsDenied, userPosition, origin, applyPosition])

  const handleMapClick = useCallback(
    (pos: LatLng) => {
      void applyPosition(activeField, pos)
    },
    [activeField, applyPosition],
  )

  const runSearch = useCallback(
    async (field: ActiveField, query: string) => {
      const q = query.trim()
      if (q.length < 3) {
        setSearchError('Digite pelo menos 3 caracteres')
        return
      }
      setSearching(true)
      setSearchError(null)
      try {
        const hit = await searchAddress(q)
        if (!hit) {
          setSearchError('Endereço não encontrado')
          return
        }
        if (field === 'origin') setOriginLabel(hit.label)
        else setDestinationLabel(hit.label)
        await applyPosition(field, hit.position)
      } catch {
        setSearchError('Busca indisponível. Tente tocar no mapa.')
      } finally {
        setSearching(false)
      }
    },
    [applyPosition],
  )

  const useMyLocationAsOrigin = useCallback(() => {
    if (!navigator.geolocation) {
      setSearchError('GPS não disponível neste dispositivo')
      return
    }
    setLocating(true)
    setSearchError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setOriginLabel('Minha localização')
        await applyPosition('origin', p)
        setLocating(false)
      },
      () => {
        setSearchError('Permissão de localização negada')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    )
  }, [applyPosition])

  const reset = () => {
    setOrigin(null)
    setDestination(null)
    setOriginLabel('')
    setDestinationLabel('')
    setActiveField('origin')
    setResult(null)
    setError(null)
    setSearchError(null)
  }

  const fallbackDistance = useMemo(() => {
    if (!origin || !destination) return null
    return haversineKm(origin, destination)
  }, [origin, destination])

  const onEstimate = async () => {
    if (!origin || !destination) return
    setLoading(true)
    setError(null)
    try {
      const pred = await fetchPrediction(origin, destination)
      setResult(pred)
      if (!originLabel) {
        setOriginLabel(await reverseAddress(origin.lat, origin.lng))
      }
      if (!destinationLabel) {
        setDestinationLabel(await reverseAddress(destination.lat, destination.lng))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na previsão')
    } finally {
      setLoading(false)
    }
  }

  const helpText = gpsDenied
    ? 'GPS indisponível — mapa em Recife (Marco Zero). Defina origem e destino.'
    : 'Toque no mapa ou digite o endereço e pressione Enter.'

  return (
    <div className="app">
      <header className="top-bar">
        <DeslocLogo compact />
        <span className="top-bar__badge">Simulador</span>
      </header>

      <div className="map-stage">
        <MapPicker
          ready={ready}
          mapCenter={mapCenter}
          initialZoom={initialZoom}
          origin={origin}
          destination={destination}
          userPosition={userPosition}
          onPick={handleMapClick}
        />

        <div className="bottom-sheet">
          <RouteSearch
            originText={originLabel}
            destinationText={destinationLabel}
            activeField={activeField}
            onActiveFieldChange={setActiveField}
            onOriginTextChange={setOriginLabel}
            onDestinationTextChange={setDestinationLabel}
            onSearchOrigin={() => void runSearch('origin', originLabel)}
            onSearchDestination={() => void runSearch('destination', destinationLabel)}
            onUseMyLocation={useMyLocationAsOrigin}
            searching={searching}
            locating={locating}
            searchError={searchError}
          />

          <p className="sheet-help">{helpText}</p>

          {error && <p className="error" role="alert">{error}</p>}

          {result && origin && destination && (
            <TripSummary
              originLabel={originLabel || 'Origem'}
              destinationLabel={destinationLabel || 'Destino'}
              result={result}
              fallbackDistanceKm={fallbackDistance}
            />
          )}

          <div className="actions">
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Limpar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canEstimate || loading}
              onClick={onEstimate}
            >
              {loading ? 'Calculando…' : 'Estimar corrida'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'

type ActiveField = 'origin' | 'destination'

type Props = {
  originText: string
  destinationText: string
  activeField: ActiveField
  onActiveFieldChange: (f: ActiveField) => void
  onOriginTextChange: (v: string) => void
  onDestinationTextChange: (v: string) => void
  onSearchOrigin: () => void
  onSearchDestination: () => void
  onUseMyLocation: () => void
  searching: boolean
  locating: boolean
  searchError: string | null
}

export function RouteSearch({
  originText,
  destinationText,
  activeField,
  onActiveFieldChange,
  onOriginTextChange,
  onDestinationTextChange,
  onSearchOrigin,
  onSearchDestination,
  onUseMyLocation,
  searching,
  locating,
  searchError,
}: Props) {
  const [showGpsHint, setShowGpsHint] = useState(false)

  return (
    <div className="route-search">
      <div className="route-search__field">
        <span className="route-search__dot route-search__dot--origin" aria-hidden="true" />
        <input
          type="text"
          className="route-search__input"
          placeholder="Origem"
          value={originText}
          onFocus={() => onActiveFieldChange('origin')}
          onChange={(e) => onOriginTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchOrigin()}
        />
        <button
          type="button"
          className="route-search__icon-btn"
          title="Usar minha localização"
          disabled={locating}
          onClick={() => {
            setShowGpsHint(true)
            onUseMyLocation()
          }}
        >
          {locating ? '…' : '◎'}
        </button>
      </div>
      <div className="route-search__connector" aria-hidden="true" />
      <div className="route-search__field">
        <span className="route-search__dot route-search__dot--dest" aria-hidden="true" />
        <input
          type="text"
          className="route-search__input"
          placeholder="Destino"
          value={destinationText}
          onFocus={() => onActiveFieldChange('destination')}
          onChange={(e) => onDestinationTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchDestination()}
        />
        <button
          type="button"
          className="route-search__icon-btn"
          title="Buscar destino"
          disabled={searching}
          onClick={onSearchDestination}
        >
          {searching && activeField === 'destination' ? '…' : '⌕'}
        </button>
      </div>
      {searchError && <p className="route-search__error" role="alert">{searchError}</p>}
      {showGpsHint && !searchError && (
        <p className="route-search__hint">Toque no mapa ou digite o endereço e pressione Enter.</p>
      )}
    </div>
  )
}

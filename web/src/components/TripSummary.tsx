import type { EstimativaCorridaResponse } from '../types/api'
import { formatKm } from '../utils/geo'

type Props = {
  originLabel: string
  destinationLabel: string
  result: EstimativaCorridaResponse
  fallbackDistanceKm: number | null
}

export function TripSummary({ originLabel, destinationLabel, result, fallbackDistanceKm }: Props) {
  const distance =
    result.distancia_km_ajustada ?? result.distancia_km ?? fallbackDistanceKm ?? null

  return (
    <div className="trip-summary">
      <div className="trip-summary__route">
        <div className="trip-summary__stop">
          <span className="trip-summary__dot trip-summary__dot--origin" />
          <p className="trip-summary__address" title={originLabel}>{originLabel}</p>
        </div>
        <div className="trip-summary__line" aria-hidden="true" />
        <div className="trip-summary__stop">
          <span className="trip-summary__dot trip-summary__dot--dest" />
          <p className="trip-summary__address" title={destinationLabel}>{destinationLabel}</p>
        </div>
      </div>
      <div className="trip-summary__price-row">
        <div>
          <p className="trip-summary__label">Sua corrida</p>
          <p className="trip-summary__price">
            {result.moeda === 'BRL' ? 'R$' : result.moeda}{' '}
            {result.valor_previsto.toFixed(2)}
          </p>
        </div>
        <div className="trip-summary__chips">
          <span className="trip-summary__chip">~{Math.round(result.duracao_estimada_min)} min</span>
          {distance != null && (
            <span className="trip-summary__chip">{formatKm(distance)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

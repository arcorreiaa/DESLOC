export type EstimativaCorridaResponse = {
  valor_previsto: number
  duracao_estimada_min: number
  moeda: string
  distancia_km?: number
  distancia_km_ajustada?: number
  duracao_modelo_min?: number
  hora_embarque?: number
  dia_semana?: number
  fator_calibracao_distancia?: number
}

import { z } from 'zod'

export const estimativaCorridaRequestSchema = z.object({
  pickup_lat: z.number().finite().min(-90).max(90),
  pickup_lon: z.number().finite().min(-180).max(180),
  dropoff_lat: z.number().finite().min(-90).max(90),
  dropoff_lon: z.number().finite().min(-180).max(180),
  embarque_em: z.string().min(1).optional(),
})

export type EstimativaCorridaRequest = z.infer<typeof estimativaCorridaRequestSchema>

export const estimativaCorridaResponseSchema = z.object({
  valor_previsto: z.number(),
  duracao_estimada_min: z.number(),
  moeda: z.string(),
  distancia_km: z.number().optional(),
  distancia_km_ajustada: z.number().optional(),
  duracao_modelo_min: z.number().optional(),
  hora_embarque: z.number().optional(),
  dia_semana: z.number().optional(),
  fator_calibracao_distancia: z.number().optional(),
})

export type EstimativaCorridaResponse = z.infer<typeof estimativaCorridaResponseSchema>

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
})

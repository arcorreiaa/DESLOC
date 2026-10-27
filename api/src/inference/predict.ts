import { z } from 'zod'
import type { SqlWarehouseClient } from './client.js'
import type { EstimativaCorridaRequest, EstimativaCorridaResponse } from '../schemas/estimativa.js'
import { estimativaCorridaResponseSchema } from '../schemas/estimativa.js'

const sqlChunkSchema = z.object({
  data_array: z.array(z.array(z.string())).optional(),
  result: z
    .object({
      data_array: z.array(z.array(z.string())).optional(),
    })
    .optional(),
})

const statementSchema = z.object({
  statement_id: z.string(),
  status: z.object({
    state: z.string(),
  }),
})

function sqlStringLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

export async function predictCorrida(
  client: SqlWarehouseClient,
  warehouseId: string,
  body: EstimativaCorridaRequest,
): Promise<EstimativaCorridaResponse> {
  await client.ensureWarehouseRunning()

  const { pickup_lat, pickup_lon, dropoff_lat, dropoff_lon, embarque_em } = body
  const embarqueSql = embarque_em ? sqlStringLiteral(embarque_em) : 'NULL'

  const sql = `SELECT desloc.esuda_mlops_prova.predict_corrida_json(
    ${pickup_lat}, ${pickup_lon}, ${dropoff_lat}, ${dropoff_lon}, ${embarqueSql}
  ) AS payload`

  const stmt = await client.request<z.infer<typeof statementSchema>>('POST', '/api/2.0/sql/statements', {
    warehouse_id: warehouseId,
    statement: sql,
    wait_timeout: '50s',
  })

  const parsedStmt = statementSchema.parse(stmt)
  if (parsedStmt.status.state !== 'SUCCEEDED') {
    throw new Error(`Consulta de inferência falhou: ${JSON.stringify(parsedStmt.status)}`)
  }

  const chunk = await client.request<z.infer<typeof sqlChunkSchema>>(
    'GET',
    `/api/2.0/sql/statements/${parsedStmt.statement_id}/result/chunks/0`,
  )
  const row = chunk.data_array?.[0] ?? chunk.result?.data_array?.[0]
  const raw = row?.[0]
  if (!raw) {
    throw new Error('Serviço de inferência não retornou dados para a corrida informada.')
  }

  const out = JSON.parse(raw) as Record<string, unknown>
  return estimativaCorridaResponseSchema.parse({
    valor_previsto: Number(out.valor_previsto),
    duracao_estimada_min: Number(out.duracao_estimada_min),
    moeda: out.moeda ?? 'BRL',
    distancia_km: out.distancia_km != null ? Number(out.distancia_km) : undefined,
    distancia_km_ajustada: out.distancia_km_ajustada != null ? Number(out.distancia_km_ajustada) : undefined,
    duracao_modelo_min: out.duracao_modelo_min != null ? Number(out.duracao_modelo_min) : undefined,
    hora_embarque: out.hora_embarque != null ? Number(out.hora_embarque) : undefined,
    dia_semana: out.dia_semana != null ? Number(out.dia_semana) : undefined,
    fator_calibracao_distancia:
      out.fator_calibracao_distancia != null ? Number(out.fator_calibracao_distancia) : undefined,
  })
}

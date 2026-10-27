import express, { type Request, type Response, type NextFunction } from 'express'
import swaggerUi from 'swagger-ui-express'
import { ZodError } from 'zod'
import { loadConfig, tryLoadConfig } from './config/env.js'
import { SqlWarehouseClient } from './inference/client.js'
import { predictCorrida } from './inference/predict.js'
import { openApiDocument } from './openapi.js'
import {
  estimativaCorridaRequestSchema,
  estimativaCorridaResponseSchema,
} from './schemas/estimativa.js'

const cfg = tryLoadConfig()
const app = express()
app.use(express.json())

app.get('/api/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.get('/api/health', (_req, res) => {
  res.json({
    status: cfg ? 'ok' : 'misconfigured',
    inferenceConfigured: Boolean(cfg),
  })
})

app.post('/api/v1/estimativa-corrida', async (req: Request, res: Response) => {
  if (!cfg) {
    res.status(503).json({ error: 'API não configurada (.env)' })
    return
  }

  try {
    const body = estimativaCorridaRequestSchema.parse(req.body)
    const client = new SqlWarehouseClient(cfg)
    const prediction = await predictCorrida(client, cfg.DATABRICKS_SQL_WAREHOUSE_ID, body)
    const payload = estimativaCorridaResponseSchema.parse(prediction)
    res.json(payload)
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json({ error: 'Requisição inválida', details: e.flatten() })
      return
    }
    res.status(502).json({ error: e instanceof Error ? e.message : 'Erro desconhecido' })
  }
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err instanceof Error ? err.message : 'Erro interno' })
})

function start() {
  const runtime = loadConfig()
  const port = runtime.API_PORT
  app.listen(port, () => {
    console.log(`DESLOC API :${port} | docs http://localhost:${port}/api/docs`)
  })
}

start()

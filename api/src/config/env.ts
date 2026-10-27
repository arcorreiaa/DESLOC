import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const envPath = path.join(repoRoot, '.env')

if (fs.existsSync(envPath)) {
  loadDotenv({ path: envPath })
}

const envSchema = z.object({
  DATABRICKS_HOST: z
    .string()
    .min(1)
    .transform((h) => (h.startsWith('http') ? h : `https://${h}`))
    .transform((h) => h.replace(/\/$/, '')),
  DATABRICKS_TOKEN: z.string().min(1),
  DATABRICKS_SQL_WAREHOUSE_ID: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(3001),
})

export type AppConfig = z.infer<typeof envSchema>

export function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
    throw new Error(
      `Variáveis obrigatórias no .env da raiz do projeto: ${missing}. Veja .env.example`,
    )
  }
  return parsed.data
}

export function tryLoadConfig(): AppConfig | null {
  const parsed = envSchema.safeParse(process.env)
  return parsed.success ? parsed.data : null
}

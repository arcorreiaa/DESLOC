import type { AppConfig } from '../config/env.js'

type HttpMethod = 'GET' | 'POST'

export class SqlWarehouseClient {
  constructor(private readonly cfg: AppConfig) {}

  async request<T>(method: HttpMethod, apiPath: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.cfg.DATABRICKS_HOST}${apiPath}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.cfg.DATABRICKS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(text || `Serviço de inferência HTTP ${res.status}`)
    }
    return (text ? JSON.parse(text) : {}) as T
  }

  async ensureWarehouseRunning(): Promise<void> {
    const id = this.cfg.DATABRICKS_SQL_WAREHOUSE_ID
    await this.request('POST', `/api/2.0/sql/warehouses/${id}/start`)
    for (let i = 0; i < 40; i++) {
      const wh = await this.request<{ state: string }>('GET', `/api/2.0/sql/warehouses/${id}`)
      if (wh.state === 'RUNNING') return
      await new Promise((r) => setTimeout(r, 2000))
    }
    throw new Error('SQL Warehouse indisponível')
  }
}

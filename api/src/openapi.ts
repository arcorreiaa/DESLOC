export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'DESLOC API',
    version: '1.0.0',
    description:
      'API REST do simulador DESLOC — estimativa de valor e duração de corrida via serviço de inferência remoto.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Desenvolvimento local' }],
  paths: {
    '/api/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica se o backend está configurado',
        responses: {
          '200': {
            description: 'Status do serviço',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['ok', 'misconfigured'] },
                    inferenceConfigured: { type: 'boolean' },
                  },
                  required: ['status', 'inferenceConfigured'],
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/estimativa-corrida': {
      post: {
        tags: ['Previsão'],
        summary: 'Estima valor e duração da corrida',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pickup_lat: { type: 'number', example: -23.55 },
                  pickup_lon: { type: 'number', example: -46.63 },
                  dropoff_lat: { type: 'number', example: -23.56 },
                  dropoff_lon: { type: 'number', example: -46.65 },
                  embarque_em: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Horário de embarque (ISO 8601). Default: agora.',
                  },
                },
                required: ['pickup_lat', 'pickup_lon', 'dropoff_lat', 'dropoff_lon'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Previsão retornada pelo Databricks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valor_previsto: { type: 'number' },
                    duracao_estimada_min: { type: 'number' },
                    moeda: { type: 'string', example: 'BRL' },
                    distancia_km: { type: 'number' },
                    distancia_km_ajustada: { type: 'number' },
                    duracao_modelo_min: { type: 'number' },
                    hora_embarque: { type: 'number' },
                    fator_calibracao_distancia: { type: 'number' },
                  },
                  required: ['valor_previsto', 'duracao_estimada_min', 'moeda'],
                },
              },
            },
          },
          '400': { description: 'Corpo inválido' },
          '503': { description: 'Backend sem configuração Databricks' },
          '502': { description: 'Falha ao consultar Databricks' },
        },
      },
    },
  },
} as const

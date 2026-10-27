# DESLOC — Trabalho de MLOps

**Instituição:** Faculdade ESUDA  
**Pós-graduação:** Engenharia de Software, Inteligência Artificial e IoT  
**Disciplina:** MLOps (Operações de Machine Learning)  
**Atividade:** Projeto integrador DESLOC — simulador de corrida com previsão de valor e tempo  
**Entrega:** 7 de novembro de 2026

---

## 1. Objetivo

Desenvolver, sobre o ecossistema de mobilidade **DESLOC**, uma solução de MLOps que atenda ao enunciado da disciplina: modelagem de **duração** e **valor** da corrida, validação de hipótese de negócio, **serviço de inferência** e **aplicação** para o usuário final escolher origem e destino e visualizar a estimativa.

Este repositório Git contém exclusivamente a **aplicação** (API REST e interface web). Todo o pipeline de dados, treinamento, validação e publicação de inferência foi implementado no **Databricks**, no workspace do aluno.

---

## 2. Atendimento ao enunciado

| Requisito                                                                       | Como foi atendido                                                                                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Feature e modelo de **duração**; uso da duração estimada no modelo de **valor** | No Databricks: preparação de dados, modelo de duração com previsões **out-of-fold** (`oof_duracao`), modelo de valor utilizando `duracao_estimada_oof` |
| **Validar hipótese** de que corridas mais longas geram maior lucro (`vlr_pago`) | No Databricks: análise estatística (correlação, regressão) e visualizações no notebook de validação da hipótese                                        |
| **Aplicação web** (origem/destino → preço previsto)                             | Repositório: `web/` — simulador com mapa e formulário de rota                                                                                          |
| Integração ponta a ponta                                                        | Repositório: `api/` — backend que consome o serviço de inferência publicado no Databricks                                                              |
| Versionamento                                                                   | Este repositório (aplicação) + artefatos e notebooks no Databricks                                                                                     |

---

## 3. Trabalho realizado no Databricks

A seguir, o que foi **feito no workspace** (não faz parte deste Git). Os notebooks e tabelas estão no catálogo/schema da prova (`esuda_mlops_prova`), no ambiente Databricks.

### 3.1 Dados

- Utilização da camada de features do projeto DESLOC (`desloc.silver.tbl_features`): coordenadas de origem e destino, distância, duração realizada, valor pago (`vlr_pago` como proxy de lucro), variáveis de tempo (hora, dia da semana, mês, período).
- Construção da tabela `esuda_mlops_prova.corridas_preparadas`: registros filtrados e padronizados para treino (distância, duração e lucro positivos; campos renomeados para o fluxo da prova).
- Ampliação regional com registros sintéticos na **grande Recife**, preservando o schema e estatísticas de duração e lucro por quilômetro observadas na base original, para melhorar estimativas fora do eixo São Paulo.

### 3.2 Modelagem

- **Modelo de duração:** gradient boosting sobre features geoespaciais e distância; geração de `esuda_mlops_prova.oof_duracao` (previsões OOF) para uso seguro no modelo de valor.
- **Modelo de valor:** gradient boosting para previsão de **lucro** (`vlr_pago`), comparando cenários com e sem a duração estimada; modelo final incorpora `duracao_estimada_oof`, conforme solicitado.
- **Validação da hipótese:** estudo da relação entre duração da corrida e lucro; documentação dos resultados no notebook de validação (métricas e gráficos).

### 3.3 Serviço de inferência

- Função Unity Catalog `desloc.esuda_mlops_prova.predict_corrida_json`, invocada via SQL Warehouse.
- Entrada: latitude/longitude de origem e destino e instante de embarque.
- Saída: JSON com valor previsto, duração estimada em minutos, distâncias e metadados de apoio.
- A função consolida as previsões treinadas no pipeline (incluindo OOF de duração) e regras de calibração de distância e limites de duração coerentes com o histórico.

A documentação operacional dos notebooks, ordem de execução e manutenção do pipeline **permanece no Databricks**.

---

## 4. Arquitetura da aplicação (este repositório)

```
┌──────────────┐      HTTP       ┌──────────────┐      SQL (inferência)      ┌─────────────┐
│    web/      │ ──────────────► │    api/      │ ─────────────────────────► │  Serviço    │
│  React+Vite  │  /api/v1/...    │ Express+TS   │   (publicado no workspace) │  remoto     │
│  Leaflet     │                 │ OpenAPI 3    │                            │             │
└──────────────┘                 └──────────────┘                            └─────────────┘
```

| Módulo   | Responsabilidade                                                                              |
| -------- | --------------------------------------------------------------------------------------------- |
| **web/** | Interface DESLOC: mapa, origem/destino (texto ou toque), exibição de preço, tempo e endereços |
| **api/** | API REST documentada; validação de entrada; chamada ao serviço de inferência remoto           |

Contrato principal: `POST /api/v1/estimativa-corrida`  
Documentação interativa: **http://localhost:3001/api/docs** (com a API em execução).

---

## 5. Execução para avaliação

Na raiz do projeto:

```bash
npm run setup    # primeira vez
npm start
```

| Aplicação     | Endereço                       |
| ------------- | ------------------------------ |
| Simulador     | http://localhost:5173          |
| API (Swagger) | http://localhost:3001/api/docs |

**Roteiro de demonstração:** abrir o simulador → definir origem e destino → **Estimar corrida** → conferir valor e duração.

Para ambiente local, utilizar o arquivo `.env` conforme `.env.example` (configuração de acesso ao serviço de inferência — não versionado).

Execução opcional em containers: `docker compose up --build`.

---

## 6. Estrutura do repositório

```
api/              Backend TypeScript (Express, Zod, OpenAPI)
web/              Frontend TypeScript (React, Vite, Leaflet)
package.json      Orquestra API + web (`npm start`)
docker-compose.yml
.env.example
```

Não há notebooks, scripts de pipeline nem artefatos de modelo neste repositório.

---

## 7. Tecnologias

| Camada        | Tecnologias                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| Frontend      | React 19, TypeScript, Vite, Leaflet, geocodificação OpenStreetMap (Nominatim)       |
| Backend       | Node.js, TypeScript, Express, Zod, Swagger UI                                       |
| MLOps / dados | Databricks (Unity Catalog, SQL Warehouse, notebooks da prova `esuda_mlops_prova_*`) |

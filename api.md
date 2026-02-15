# API and Integrations

This file documents local API routes in the Next.js app and the backend services those routes depend on.

## Local API routes

### Session

`GET /api/session`
- Creates a session cookie when missing and returns `{ sessionId, experimentId }`.

`POST /api/session`
- Binds a session to an experiment.
- Body:

```json
{
  "experimentId": "uuid"
}
```

### Products

`GET /api/products?type=hotel|airline`
- Proxies product list requests to backend catalog APIs.
- Query params other than `type` are forwarded.

`GET /api/products/{id}`
- Proxies product detail requests.

### Pricing

`GET /api/pricing?productId={id}&sessionId={sid}&experimentId={eid}`
- Calls pricing provider endpoint selected by store mode.
- Returns:

```json
{
  "price": 123.45,
  "currency": "EUR",
  "cachedAt": "2026-01-01T12:00:00.000Z"
}
```

- `productId` is required.
- If provider is unavailable, route falls back to random price generation.

### Ingestion

`POST /api/ingest`
- Accepts event payloads from the frontend and forwards them to backend ingest.
- Adds `storeMode`, `userAgent`, and `ts` when needed.

### Admin

`GET /api/admin/experiments`
- Lists experiments (latest first).
- Optional `?id={experimentId}` fetches a single experiment.

`POST /api/admin/experiments`
- Creates a new experiment.
- Body:

```json
{
  "subject_name": "string",
  "xp_human_only": false,
  "xp_market_mode": "hotel",
  "xp_task_id": "uuid"
}
```

`GET /api/admin/tasks`
- Lists tasks (latest first).

`POST /api/admin/tasks`
- Creates a task.
- Body:

```json
{
  "task_name": "string",
  "task_description": "string",
  "task_def_of_done": "string"
}
```

## Backend service integration

All service URLs are configured via `.env.local`.

### Event ingestion backend

Used by: `POST /api/ingest`

Target endpoint:

```text
POST {BACKEND_URL}/api/kafka/ingest
```

Expected payload:

```json
{
  "sessionId": "string",
  "experimentId": "string (optional)",
  "storeMode": "hotel | airline",
  "eventName": "string",
  "page": "string",
  "ts": "ISO8601 timestamp",
  "productId": "string (optional)",
  "metadata": "object (optional)",
  "userAgent": "string (optional)"
}
```

### Pricing provider

Used by: `GET /api/pricing`

Target endpoints:

```text
GET {PRICING_PROVIDER_URL}/api/hotel/price/{productId}?sessionId={sid}&experimentId={eid}
GET {PRICING_PROVIDER_URL}/api/airline/price/{productId}?sessionId={sid}&experimentId={eid}
```

Provider response fields consumed by web:

```json
{
  "price": 123.45,
  "base_price": 100,
  "markup": 23.45,
  "elasticity": 0.8
}
```

Price logging side-effect from `GET /api/pricing`:

```text
POST {BACKEND_URL}/api/kafka/price-log
```

Logged payload includes `productId`, `price`, `sessionId`, `experimentId`, `storeMode`, and `ts`.

### Product catalog backend

Used by product proxy routes:

```text
GET {BACKEND_URL}/api/products/type/{type}
GET {BACKEND_URL}/api/products/{id}
```

## Adding new events

1. Add the new name to `EventName` in `src/lib/events.ts`.
2. Add the same name to `eventNames` and the Zod enum in `eventBaseSchema`.
3. Emit it from UI code through the existing `definedInteraction` custom event pattern.
4. Confirm backend ingest accepts and stores the new event.

Example emission:

```ts
const event = new CustomEvent('definedInteraction', {
  detail: {
    eventName: 'your_event_name',
    productId: 'optional-product-id',
    metadata: { source: 'product_card' },
  },
});

document.dispatchEvent(event);
```

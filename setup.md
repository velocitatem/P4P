# Setup

This file covers local setup, environment configuration, and the event schema used by the web client.

## Local setup

Node.js 18+ is enough for local development.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Production run:

```bash
npm run build
npm start
```

## Environment variables

The runtime config is validated in `src/lib/config.ts`.

### Required

| Variable | Description |
| --- | --- |
| `STORE_MODE` | Active storefront mode: `hotel` or `airline`. |
| `NEXT_PUBLIC_API_BASE` | Absolute base URL for the app (for API calls and SSR URLs). |
| `NEXT_PUBLIC_APP_ENV` | App environment: `dev` or `prod`. |

### Common service configuration

| Variable | Description | Default |
| --- | --- | --- |
| `BACKEND_URL` | Backend API used for ingest and product proxy routes. | `http://localhost:5000` |
| `PRICING_PROVIDER_URL` | Pricing provider base URL. | `http://localhost:5001` |
| `NEXT_PUBLIC_HOVER_THRESHOLD` | Dwell threshold in ms before hover events are emitted. | `1200` |

### Optional adapters and infrastructure

| Variable |
| --- |
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `AIRTABLE_API_KEY` |
| `AIRTABLE_BASE_ID` |
| `AIRTABLE_TABLE_NAME` |
| `KAFKA_HOST` |
| `KAFKA_PORT` |
| `REDIS_HOST` |
| `REDIS_PORT` |
| `SESSION_STORE_ADAPTER` |
| `PRODUCT_SOURCE_ADAPTER` |
| `EXPERIMENT_STORE_ADAPTER` |

See `.env.example` for full inline notes.

## Event schema

Canonical schema source: `src/lib/events.ts`.

### Base payload

Every tracked interaction resolves to this shape:

```json
{
  "sessionId": "string",
  "experimentId": "string (optional)",
  "storeMode": "hotel | airline",
  "ts": "ISO8601 timestamp",
  "page": "string",
  "eventName": "EventName",
  "productId": "string (optional)",
  "metadata": "object (optional)",
  "userAgent": "string (optional)"
}
```

`POST /api/ingest` enriches outgoing payloads with `storeMode`, `userAgent`, and `ts` when missing.

### Canonical events (17)

Session:
- `session_start`

Navigation and discovery:
- `page_view`
- `view_item_page`
- `learn_more_about_item`

Cart flow:
- `add_item_to_cart`
- `remove_item`
- `checkout_start`
- `purchase_complete`

Search and filtering:
- `search`
- `filter_for_date`
- `filter_for_amenities`
- `filter_for_price`
- `sort_change`

Dwell signals:
- `hover_over_title`
- `hover_over_paragraph`
- `hover_over_link`
- `hover_over_button`

### Validation

- Compile-time: `EventName` and `EventBase` types
- Runtime: Zod schema `eventBaseSchema`

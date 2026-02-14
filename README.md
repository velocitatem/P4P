# PHANTOM: Pricing Heuristics Against Non-human Transaction Orchestration Mechanisms

A research platform for studying dynamic pricing behavior under agent-mediated transactions. This framework provides controlled experimental environments for analyzing how pricing systems respond to automated browsing patterns and developing robust pricing policies.

## Overview

PHANTOM is a Next.js-based web platform designed to support empirical research on dynamic pricing in the presence of LLM agents. The system enables researchers to:

- Deploy realistic e-commerce interfaces with dynamic pricing (hotel and airline modes)
- Track granular user interaction data through canonical event schemas
- Integrate with external pricing providers and event streaming infrastructure
- Conduct controlled experiments with configurable parameters

The platform serves as the experimental substrate for research on detecting and defending against agent-based price reconnaissance while maintaining legitimate user experience.

## Architecture

### Core Components

**Web Application** (Next.js 16 with App Router)
- Dual-mode product catalog (hotel/airline) with mode-specific theming
- Session management with experiment tracking
- Event emission pipeline for behavioral telemetry
- Integration points for pricing providers and backend services

**Event Tracking System**
- 17 canonical interaction events covering full user journey
- Custom event bus architecture using DOM event delegation
- Configurable hover tracking with threshold-based emission
- Schema validation with runtime type safety

**Backend Integration**
- HTTP-based pricing provider interface
- Kafka event ingestion for behavioral data streams
- Optional persistence adapters (Supabase, Airtable)
- Experiment management and task assignment

### Data Flow

```
User Interaction → Event Emission → API Route → Backend Service → Kafka Topic
                                  ↓
                            Pricing Query → Provider Service → Dynamic Price
```

All events conform to a base schema with sessionId, experimentId, timestamp, and metadata fields. Events are validated at runtime and forwarded to the configured backend for persistence and analysis.

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend services (optional for standalone development)

### Setup

```bash
git clone <repository-url>
cd PHANTOM_web
npm install
cp .env.example .env.local
```

Edit `.env.local` to configure required environment variables:

```bash
STORE_MODE=hotel                           # 'hotel' or 'airline'
NEXT_PUBLIC_API_BASE=http://localhost:3000
NEXT_PUBLIC_APP_ENV=dev
BACKEND_URL=http://localhost:5000          # event ingestion service
PRICING_PROVIDER_URL=http://localhost:5001 # dynamic pricing service
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

**Required**
- `STORE_MODE`: Platform mode determining product catalog and UI theme
- `NEXT_PUBLIC_API_BASE`: Base URL for API endpoints
- `NEXT_PUBLIC_APP_ENV`: Application environment (dev/prod)

**Optional**
- `BACKEND_URL`: Backend API URL for event ingestion (defaults to localhost:5000)
- `PRICING_PROVIDER_URL`: Pricing service URL (defaults to localhost:5001)
- `NEXT_PUBLIC_HOVER_THRESHOLD`: Hover dwell time threshold in milliseconds (default: 1200)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase connection for experiment tracking
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `AIRTABLE_API_KEY`: Airtable API key for session sync
- `AIRTABLE_BASE_ID`: Airtable base identifier
- `KAFKA_HOST`: Kafka broker hostname
- `KAFKA_PORT`: Kafka broker port
- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port

See `.env.example` for complete configuration documentation.

## Event Schema

The platform tracks 17 canonical events across the user journey:

**Session Lifecycle**
- `session_start`: Initial session establishment with browser context

**Navigation and Discovery**
- `page_view`: Page navigation events
- `view_item_page`: Product detail page access
- `learn_more_about_item`: Extended product information engagement

**Cart Operations**
- `add_item_to_cart`: Item addition to shopping cart
- `remove_item`: Item removal from cart
- `checkout_start`: Checkout flow initiation
- `purchase_complete`: Transaction completion

**Search and Filtering**
- `search`: Search query submission
- `filter_for_date`: Date range filter application
- `filter_for_amenities`: Amenities filter modification
- `filter_for_price`: Price range filter adjustment
- `sort_change`: Sort order modification

**Dwell Signals**
- `hover_over_title`: Hover events on heading elements
- `hover_over_paragraph`: Hover events on text content
- `hover_over_link`: Hover events on hyperlinks
- `hover_over_button`: Hover events on interactive buttons

All events include sessionId, experimentId (when applicable), timestamp, page context, and optional metadata fields. Event schemas are defined in `src/lib/events.ts` with Zod validation.

## API Routes

### Session Management
- `GET /api/session`: Retrieve or create session identifier

### Pricing
- `GET /api/pricing?productId={id}&sessionId={sid}&experimentId={eid}`: Query dynamic price for product

### Event Ingestion
- `POST /api/ingest`: Submit interaction event to backend pipeline

### Product Catalog
- `GET /api/products?type={hotel|airline}`: List products by type
- `GET /api/products/{id}`: Retrieve product details

### Experiment Administration
- `GET /api/admin/experiments`: List configured experiments
- `GET /api/admin/tasks`: Retrieve experiment tasks

## Experiment Workflow

Experiments are managed through the Supabase-backed experiment store. The typical workflow:

1. Create experiment record in `experiments` table with market mode and parameters
2. Generate unique UUID for experiment
3. Participants access platform via `/start-task?uuid={experiment-id}`
4. Session is bound to experiment, all events tagged with experimentId
5. Pricing provider can condition on experimentId for treatment assignment

Task-based experiments store objective descriptions in the `tasks` table and associate them with experiment records.

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard. Ensure `NEXT_PUBLIC_API_BASE` points to your production domain.

### Docker

```bash
docker build -t phantom-web .
docker run -p 3000:3000 --env-file .env.local phantom-web
```

### Self-Hosted

Build the production bundle and serve with any Node.js process manager:

```bash
npm run build
pm2 start npm --name phantom -- start
```

## Integration with Backend Services

### Event Ingestion

The platform expects a backend service implementing the following endpoint:

```
POST /api/kafka/ingest
Content-Type: application/json

{
  "sessionId": "string",
  "experimentId": "string | null",
  "storeMode": "hotel | airline",
  "eventName": "string",
  "page": "string",
  "ts": "ISO8601 timestamp",
  "productId": "string | null",
  "metadata": "object | null",
  "userAgent": "string | null"
}
```

Reference implementation available in `backend/` directory of parent repository.

### Pricing Provider

The pricing service must implement mode-specific endpoints:

```
GET /api/hotel/price/{productId}?sessionId={sid}&experimentId={eid}
GET /api/airline/price/{productId}?sessionId={sid}&experimentId={eid}

Response:
{
  "price": number,
  "base_price": number,
  "markup": number,
  "elasticity": number
}
```

The platform includes fallback random pricing if provider is unavailable.

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── hotel/             # Hotel mode routes
│   ├── airline/           # Airline mode routes
│   ├── admin/             # Experiment administration
│   └── api/               # API route handlers
├── components/            # React components
│   ├── ui/                # Shared UI elements
│   └── feats/             # Feature-specific components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Core library code
│   ├── events.ts          # Event schema definitions
│   ├── config.ts          # Environment validation
│   └── sessionStore.ts    # Session persistence
└── middleware.ts          # Request middleware (mode routing)
```

### Type Safety

All event emissions are type-checked against the `EventName` union type. Runtime validation uses Zod schemas defined in `src/lib/events.ts`.

### Adding New Events

1. Add event name to `EventName` type in `src/lib/events.ts`
2. Update `eventNames` array and Zod schema enum
3. Emit event using `definedInteraction` custom event:

```typescript
const e = new CustomEvent('definedInteraction', {
  detail: { 
    eventName: 'your_event_name',
    productId: 'optional-product-id',
    metadata: { /* optional metadata */ }
  }
});
document.dispatchEvent(e);
```

## Research Applications

This platform has been used to study:

- Behavioral signatures of agent vs. human browsing patterns
- Dynamic pricing policy robustness under agent reconnaissance
- Cost of Information erosion in multi-session agent workflows
- Markov transition kernel separability for human-agent classification

For experimental methodology and results, see the accompanying research paper.

## License

To be determined.

## Citation

If you use this platform in your research, please cite:

```
[Citation format to be added after publication]
```

## Contact

For questions or collaboration inquiries, contact the repository maintainer.

## Acknowledgments

This research platform was developed as part of a thesis on dynamic pricing mechanisms under agent-mediated transactions.

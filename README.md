# PHANTOM Web

Next.js interface for PHANTOM pricing experiments in hotel and airline modes.

## Dataflow

```text
┌─────────────────────────────────────┐
│User Interactions ──▶ Event Emissions│
└────────────────────────────┬────────┘
                             ▼         
 Pricing API ◀────────┐Backend Service 
 Kafka ◀── Ingestion ◀┘                
```

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Build and run production mode:

```bash
npm run build
npm start
```

## Documentation

- `setup.md`: setup, environment variables, and event schema
- `api.md`: API routes, backend integrations, and adding new events

## Contact

For collaboration or questions: https://alves.world

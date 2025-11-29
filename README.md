# Product API

A Next.js 16 REST API for managing products and sections with cookie-based authentication.

## Setup

```bash
pnpm install
pnpm db:push      # Create database schema
pnpm db:seed      # Seed with sample data
```

## Development

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm lint         # Run Biome linter
pnpm test         # Run tests
```

## Production Build

```bash
NODE_ENV=production pnpm build
pnpm start
```

## API Endpoints

All `/api/v1/*` endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (body: `{username, password}`) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/v1/section` | List sections |
| POST | `/api/v1/section` | Create section |
| GET | `/api/v1/section/:id` | Get section |
| PUT | `/api/v1/section/:id` | Update section |
| DELETE | `/api/v1/section/:id` | Delete section |
| GET | `/api/v1/product` | List products |
| POST | `/api/v1/product` | Create product |
| GET | `/api/v1/product/:id` | Get product |
| PUT | `/api/v1/product/:id` | Update product |
| DELETE | `/api/v1/product/:id` | Delete product |

## Tech Stack

- Next.js 16 (Turbopack)
- Drizzle ORM + SQLite
- Zod validation
- Biome linting
- Vitest testing

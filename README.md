# Product API

A Next.js 16 REST API for managing products and sections with cookie-based authentication.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [pnpm](https://pnpm.io/installation) (recommended) or npm

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 - the database is created and seeded automatically on first run.

## Test Credentials

| Username | Password | Role |
|----------|----------|------|
| user | user | USER |
| admin | admin | ADMIN |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm test` | Run Vitest tests |
| `pnpm db:studio` | Open Drizzle Studio (DB browser) |

## Environment Variables (Optional)

Create a `.env.local` file for optional features:

```bash
OPENAI_API_KEY=sk-...   # Required for AI chat widget
CHAT_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4.1-nano
```

## API Endpoints

All `/api/v1/*` endpoints require authentication (login first).

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

## Training Exercises

- [AI for Coding](docs/ai-for-coding.md) - Using AI to develop software (prompts from IDE/CLI)
- [AI in Apps](docs/ai-in-apps.md) - Using AI in software (API integrations)

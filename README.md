# Product API

A Next.js 16 REST API for managing products and sections with cookie-based authentication.

## Prerequisites

You can use either npm or pnpm as your package manager:

- [npm](https://nodejs.org/) (included with Node.js)
- [pnpm](https://pnpm.io/installation)

## Setup

```bash
# Using pnpm
pnpm install
pnpm db:push      # Create database schema
pnpm db:seed      # Seed with sample data

# Using npm
npm install
npm run db:push
npm run db:seed
```

## Development

```bash
# Using pnpm
pnpm dev          # Start dev server at http://localhost:3000
pnpm lint         # Run Biome linter
pnpm test         # Run tests

# Using npm
npm run dev
npm run lint
npm test
```

## Production Build

```bash
# Using pnpm
NODE_ENV=production pnpm build
pnpm start

# Using npm
NODE_ENV=production npm run build
npm start
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

## Training Exercises

- [AI for Coding](docs/ai-for-coding.md) - Using AI to develop software (prompts from IDE/CLI)
- [AI in Apps](docs/ai-in-apps.md) - Using AI in software (API integrations)

# Onboarding Guide

Quick start guide for engineers and product managers joining the Next.js Reference Project.

**Quick Links:** [Architecture](../ARCHITECTURE.md) | [Setup](../README.md) | [History](../CONVERSATION_SUMMARY.md)

---

## For Engineers

### Setup

```bash
git clone <repository-url> && cd reference-next-js-project
pnpm install
pnpm db:push    # Create schema
pnpm db:seed    # Seed data
pnpm dev        # http://localhost:3000
```

**Verify:** Login with `user/user` or `admin/admin` → Navigate to Products/Sections pages

### Architecture

**Layered Pattern:** Routes → Services → Repositories → Database

**Structure:**
- `src/app/api/` - API routes (Next.js Route Handlers)
- `src/lib/services/` - Business logic & validation
- `src/lib/repositories/` - Data access (Drizzle ORM)
- `src/lib/types/` - Zod schemas & TypeScript types
- `src/lib/core/` - Shared utilities (HTTP, i18n, auth)

**Principles:** Separation of concerns, downward dependencies, end-to-end type safety

### Coding Patterns

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **API Routes** | Handle HTTP, validate input, delegate to services | `handleError()`, Zod validation, `HTTP_STATUS` constants |
| **Services** | Business logic, validate rules, transform data | Throw `NotFoundError`/`ValidationError`, check related entities |
| **Repositories** | Database access via Drizzle ORM | Return `null` for not found, simple queries |
| **Types** | Zod schemas + TypeScript types | `z.infer<typeof schema>` for type inference |

**Key Patterns:**
- **Error Handling:** Use `handleError()` wrapper, custom error classes, `Messages` constants
- **Validation:** Zod schemas in `src/lib/types/`, validate in routes before services
- **Auth:** `getSession()` for auth, `session.user.role === "ADMIN"` for authorization
- **Type Safety:** Define Zod schema → infer TypeScript type → use in routes/services

**See:** `src/app/api/v1/product/route.ts`, `src/lib/services/productService.ts`, `src/lib/repositories/productRepository.ts`

### Testing

**Structure:** `tests/` mirrors `src/` structure | **Runner:** Vitest | **Mock:** Repositories when testing services

```bash
pnpm test          # Run once
pnpm test:watch    # Watch mode
```

**Pattern:** Mock repositories → Test service business logic → Test error cases → Use `beforeEach` to reset

**Example:** See `tests/lib/services/productService.test.ts`

### Git & Code Review

**Workflow:** `main` branch → `feature/description` → PR → Review → Merge

**Review Checklist:**
- [ ] Follows layered pattern (routes → services → repositories)
- [ ] Uses Zod schemas for validation
- [ ] Uses `handleError()` for errors
- [ ] Includes tests
- [ ] `pnpm lint` passes
- [ ] TypeScript compiles

**Common Issues:** Business logic in routes, direct DB access, missing error handling/validation, hardcoded values

---

## For Product Managers

### Product Purpose

**Reference/training project** for Next.js 16, Drizzle ORM, and TypeScript patterns. Not a production app.

### User Personas

| Role | Access | Credentials | Use Cases |
|------|--------|-------------|-----------|
| **Admin** | Full CRUD | `admin/admin` | Create/update/delete products & sections |
| **User** | Read-only | `user/user` | View products, browse sections |

### Features

**Authentication:** Cookie-based sessions, role-based access (USER/ADMIN), login/logout

**Product Management:** List/View/Create/Update/Delete (Admin only for CUD operations)

**Section Management:** List/View/Create/Update/Delete (Admin only for CUD operations)

### API Endpoints

| Method | Endpoint | Auth | Admin Required |
|--------|----------|------|----------------|
| POST | `/api/auth/login` | No | No |
| POST | `/api/auth/logout` | Yes | No |
| GET | `/api/v1/product` | Yes | No |
| POST | `/api/v1/product` | Yes | Yes |
| GET | `/api/v1/product/:id` | Yes | No |
| PUT | `/api/v1/product/:id` | Yes | Yes |
| DELETE | `/api/v1/product/:id` | Yes | Yes |
| GET | `/api/v1/section` | Yes | No |
| POST | `/api/v1/section` | Yes | Yes |
| GET | `/api/v1/section/:id` | Yes | No |
| PUT | `/api/v1/section/:id` | Yes | Yes |
| DELETE | `/api/v1/section/:id` | Yes | Yes |

### Data Model

**Sections:** `id` (int), `name` (string, unique)  
**Products:** `id` (int), `name` (string, unique), `price` (real), `sectionId` (int, FK)  
**Relationship:** One section → Many products (1:N)

### Product Context

**Status:** ✅ Backend API, auth, UI pages, seeded DB | 📝 Documentation

**Limitations:** Hardcoded users, SQLite (dev only), basic UI

**Future:** See `docs/product-creation-user-stories.md` and `docs/product-creation-research.md`

---

## Getting Help

- **Architecture:** [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Setup:** [README.md](../README.md), [CONVERSATION_SUMMARY.md](../CONVERSATION_SUMMARY.md)
- **Code Examples:** `src/lib/services/`, `src/lib/repositories/`, `tests/lib/services/`


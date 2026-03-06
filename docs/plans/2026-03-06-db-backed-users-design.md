# Design: DB-backed Users

**Date:** 2026-03-06
**Scope:** Move hardcoded in-memory users to a SQLite `users` table, keeping the existing session/cookie auth flow intact.

## Context

Currently `src/lib/auth/index.ts` holds two hardcoded users in a plain array. This is inconsistent with the rest of the codebase (products/sections use Drizzle + repository pattern) and prevents any future user management.

## Approach

Follow the existing repository pattern used by products and sections.

## Changes

### 1. Schema — `src/lib/db/schema.ts`

Add a `users` table:

```ts
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // "USER" | "ADMIN"
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 2. Seed — `src/lib/db/seed.ts`

Insert the two test users using the same idempotency pattern:

```ts
const existingUsers = await db.select().from(users);
if (existingUsers.length === 0) {
  await db.insert(users).values([
    { username: "user", password: "user", role: "USER" },
    { username: "admin", password: "admin", role: "ADMIN" },
  ]);
}
```

Passwords remain plaintext (out of scope for this change).

### 3. Repository — `src/lib/repositories/userRepository.ts`

New file following the exact shape of `productRepository`:

```ts
export const userRepository = {
  async findByCredentials(username: string, password: string): Promise<User | null> {
    const result = await db.select().from(users)
      .where(and(eq(users.username, username), eq(users.password, password)));
    return result[0] ?? null;
  },
};
```

### 4. Auth — `src/lib/auth/index.ts`

- Remove hardcoded `users` array and inline `User` type
- Import `User` from schema, `userRepository` from repository
- Replace `users.find(...)` in `login()` with `await userRepository.findByCredentials(username, password)`
- Session cookie, `logout`, and `getSession` are unchanged

## Out of Scope

- Password hashing
- User CRUD API endpoints
- Role-based access changes

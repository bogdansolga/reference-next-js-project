# DB-backed Users Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hardcoded in-memory users array with a SQLite `users` table, keeping the existing session/cookie auth flow intact.

**Architecture:** Add a `users` table to the Drizzle schema, seed the two test users alongside existing seed data, and introduce a `userRepository` with a single `findByCredentials` method. Auth's `login()` calls the repository instead of the in-memory array.

**Tech Stack:** Drizzle ORM + SQLite, Vitest, Next.js 16

---

### Task 1: Add `users` table to schema

**Files:**
- Modify: `src/lib/db/schema.ts`
- Modify: `tests/lib/db/schema.test.ts`

**Step 1: Write the failing test**

Add to `tests/lib/db/schema.test.ts`:

```ts
describe("users schema", () => {
  it("should have id, username, password, and role columns", () => {
    expect(users).toBeDefined();
    expect(users.id).toBeDefined();
    expect(users.username).toBeDefined();
    expect(users.password).toBeDefined();
    expect(users.role).toBeDefined();
  });
});
```

Also add `users` to the import at the top:
```ts
import { products, sections, users } from "@/lib/db/schema";
```

**Step 2: Run test to verify it fails**

```bash
pnpm test tests/lib/db/schema.test.ts
```
Expected: FAIL — `users` not exported from schema

**Step 3: Add the `users` table to schema**

Add to `src/lib/db/schema.ts`:

```ts
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**Step 4: Run test to verify it passes**

```bash
pnpm test tests/lib/db/schema.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/db/schema.ts tests/lib/db/schema.test.ts
git commit -m "[feature] Add users table to schema"
```

---

### Task 2: Create `userRepository`

**Files:**
- Create: `src/lib/repositories/userRepository.ts`
- Create: `tests/lib/repositories/userRepository.test.ts`

**Step 1: Write the failing test**

Create `tests/lib/repositories/userRepository.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { userRepository } from "@/lib/repositories/userRepository";

describe("userRepository", () => {
  beforeEach(async () => {
    await db.delete(users);
    await db.insert(users).values([
      { username: "alice", password: "pass1", role: "USER" },
      { username: "admin", password: "adminpass", role: "ADMIN" },
    ]);
  });

  it("findByCredentials returns user on valid credentials", async () => {
    const result = await userRepository.findByCredentials("alice", "pass1");
    expect(result).not.toBeNull();
    expect(result?.username).toBe("alice");
    expect(result?.role).toBe("USER");
  });

  it("findByCredentials returns null on wrong password", async () => {
    const result = await userRepository.findByCredentials("alice", "wrong");
    expect(result).toBeNull();
  });

  it("findByCredentials returns null on unknown username", async () => {
    const result = await userRepository.findByCredentials("nobody", "pass1");
    expect(result).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
pnpm test tests/lib/repositories/userRepository.test.ts
```
Expected: FAIL — `userRepository` not found

**Step 3: Create the repository**

Create `src/lib/repositories/userRepository.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type User, users } from "@/lib/db/schema";

export const userRepository = {
  async findByCredentials(username: string, password: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.password, password)));
    return result[0] ?? null;
  },
};
```

**Step 4: Run test to verify it passes**

```bash
pnpm test tests/lib/repositories/userRepository.test.ts
```
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add src/lib/repositories/userRepository.ts tests/lib/repositories/userRepository.test.ts
git commit -m "[feature] Add userRepository with findByCredentials"
```

---

### Task 3: Update seed to insert test users

**Files:**
- Modify: `src/lib/db/seed.ts`

**Step 1: Update seed.ts**

Add users seeding after the existing sections/products block in `src/lib/db/seed.ts`.

Add `users` to the import:
```ts
import { products, sections, users } from "./schema";
```

Add after the existing seed block (before `console.info`):
```ts
const existingUsers = await db.select().from(users);
if (existingUsers.length === 0) {
  await db.insert(users).values([
    { username: "user", password: "user", role: "USER" },
    { username: "admin", password: "admin", role: "ADMIN" },
  ]);
}
```

**Step 2: Verify seed runs without error**

```bash
pnpm tsx src/lib/db/seed.ts
```
Expected: "Database seeded" printed (or silent if already seeded)

**Step 3: Commit**

```bash
git add src/lib/db/seed.ts
git commit -m "[feature] Seed users table with test credentials"
```

---

### Task 4: Update auth to use the repository

**Files:**
- Modify: `src/lib/auth/index.ts`

**Step 1: Update auth/index.ts**

Replace the entire file content:

```ts
import { cookies } from "next/headers";
import { userRepository } from "@/lib/repositories/userRepository";
import type { User } from "@/lib/db/schema";

export type { User };
export type Session = { user: { id: number; username: string; role: string } };

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

export async function login(username: string, password: string): Promise<User | null> {
  const user = await userRepository.findByCredentials(username, password);
  if (!user) return null;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify({ id: user.id, username: user.username, role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return user;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    if (!session?.value) return null;

    const data = JSON.parse(session.value);
    return { user: data };
  } catch {
    return null;
  }
}
```

Note: `id` type changes from `string` to `number` (DB autoincrement). The session stores `id` as a number now — this is consistent with how products/sections work.

**Step 2: Run all tests to verify nothing is broken**

```bash
pnpm test
```
Expected: All tests PASS

**Step 3: Run the dev server and test login manually**

```bash
pnpm dev
```

Test with curl:
```bash
# Should return 200 with session cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user"}'

# Should return 401
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"wrong"}'
```

**Step 4: Commit**

```bash
git add src/lib/auth/index.ts
git commit -m "[feature] Auth uses DB-backed userRepository"
```

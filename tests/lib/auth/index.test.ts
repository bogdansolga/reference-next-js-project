import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Mock next/headers so cookies() doesn't throw outside a Next.js request context.
// For the happy path we need a functional mock; for the null-return path cookies()
// is never reached so the mock just needs to exist.
const mockCookieSet = vi.fn();
const mockCookieDelete = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: mockCookieSet,
      delete: mockCookieDelete,
      get: mockCookieGet,
    }),
  ),
}));

// Import after mocks are registered.
const { login } = await import("@/lib/auth");

describe("auth login()", () => {
  beforeEach(async () => {
    await db.delete(users);
    await db.insert(users).values([
      { username: "alice", password: "pass1", role: "USER" },
      { username: "admin", password: "adminpass", role: "ADMIN" },
    ]);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await db.delete(users);
  });

  it("returns null when credentials do not match", async () => {
    const result = await login("alice", "wrongpassword");
    expect(result).toBeNull();
    // cookies() should never be called — we return early
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("returns null when username does not exist", async () => {
    const result = await login("nobody", "pass1");
    expect(result).toBeNull();
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("returns the user and sets a session cookie when credentials match", async () => {
    const result = await login("alice", "pass1");

    expect(result).not.toBeNull();
    expect(result?.username).toBe("alice");
    expect(result?.role).toBe("USER");

    // Verify a session cookie was written
    expect(mockCookieSet).toHaveBeenCalledOnce();
    const [cookieName, cookieValue] = mockCookieSet.mock.calls[0];
    expect(cookieName).toBe("session");
    const session = JSON.parse(cookieValue);
    expect(session.username).toBe("alice");
    expect(session.role).toBe("USER");
  });
});

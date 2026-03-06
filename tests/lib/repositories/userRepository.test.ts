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

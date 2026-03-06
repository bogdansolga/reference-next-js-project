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

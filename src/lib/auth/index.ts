import { cookies } from "next/headers";

// Test users with simple passwords
export const users = [
  { id: "1", username: "user", password: "user", role: "USER" },
  { id: "2", username: "admin", password: "admin", role: "ADMIN" },
];

export type User = (typeof users)[number];
export type Session = { user: { id: string; username: string; role: string } };

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

export async function login(username: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.username === username && u.password === password);
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

import { type NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { HTTP_STATUS } from "@/lib/core/http/constants";
import { Messages } from "@/lib/core/i18n/messages";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const user = await login(username, password);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    return NextResponse.json({
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: Messages.INTERNAL_SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

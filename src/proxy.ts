/**
 * Next.js 16 Proxy - Authentication & Authorization for API Routes
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { HTTP_STATUS } from "@/lib/core/http/constants";
import { Messages } from "@/lib/core/i18n/messages";

const forbidden = () => NextResponse.json({ error: Messages.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
const unauthorized = () => NextResponse.json({ error: Messages.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // skip auth for auth endpoints
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // check authentication for /api/v1/* routes
  if (pathname.startsWith("/api/v1")) {
    const session = await getSession();
    if (!session?.user) {
      return unauthorized();
    }

    // check admin role for write operations
    const method = request.method;
    const writeMethod = ["POST", "PUT", "DELETE"].includes(method);
    if (writeMethod && session.user.role !== "ADMIN") {
      return forbidden();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

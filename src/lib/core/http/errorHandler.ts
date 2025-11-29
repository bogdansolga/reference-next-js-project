import { NextResponse } from "next/server";
import { Messages } from "@/lib/core/i18n/messages";
import { HTTP_STATUS } from "./constants";

export function handleError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.name === "NotFoundError") {
      return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.NOT_FOUND });
    }
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.BAD_REQUEST });
    }
  }

  console.error("Unexpected error:", error);
  return NextResponse.json({ error: Messages.INTERNAL_SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
}

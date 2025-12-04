import { type NextRequest, NextResponse } from "next/server";
import { HTTP_STATUS } from "@/lib/core/http/constants";
import { handleError } from "@/lib/core/http/errorHandler";
import { Messages } from "@/lib/core/i18n/messages";
import { sectionService } from "@/lib/services/sectionService";
import { createSectionSchema } from "@/lib/types/section";

export async function GET() {
  try {
    const sections = await sectionService.getAllSections();
    return NextResponse.json(sections);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: Messages.VALIDATION_FAILED, details: parsed.error.flatten() },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }
    const section = await sectionService.createSection(parsed.data);
    return NextResponse.json(section, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleError(error);
  }
}

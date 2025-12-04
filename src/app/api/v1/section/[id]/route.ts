import { type NextRequest, NextResponse } from "next/server";
import { HTTP_STATUS } from "@/lib/core/http/constants";
import { handleError } from "@/lib/core/http/errorHandler";
import { Messages } from "@/lib/core/i18n/messages";
import { sectionService } from "@/lib/services/sectionService";
import { updateSectionSchema } from "@/lib/types/section";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const section = await sectionService.getSectionById(parseInt(id, 10));
    return NextResponse.json(section);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: Messages.VALIDATION_FAILED, details: parsed.error.flatten() },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }
    const section = await sectionService.updateSection(parseInt(id, 10), parsed.data);
    return NextResponse.json(section);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sectionService.deleteSection(parseInt(id, 10));
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  } catch (error) {
    return handleError(error);
  }
}

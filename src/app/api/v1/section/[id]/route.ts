import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/core/http/errorHandler";
import { sectionService } from "@/lib/services/sectionService";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const section = await sectionService.getSectionById(parseInt(id, 10));
    return NextResponse.json(section);
  } catch (error) {
    return handleError(error);
  }
}

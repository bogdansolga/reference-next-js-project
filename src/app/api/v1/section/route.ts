import { NextResponse } from "next/server";
import { handleError } from "@/lib/core/http/errorHandler";
import { sectionService } from "@/lib/services/sectionService";

export async function GET() {
  try {
    const sections = await sectionService.getAllSections();
    return NextResponse.json(sections);
  } catch (error) {
    return handleError(error);
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { HTTP_STATUS } from "@/lib/core/http/constants";
import { handleError } from "@/lib/core/http/errorHandler";
import { Messages } from "@/lib/core/i18n/messages";
import { productService } from "@/lib/services/productService";
import { updateProductSchema } from "@/lib/types/product";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await productService.getProductById(parseInt(id, 10));
    return NextResponse.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: Messages.VALIDATION_FAILED, details: parsed.error.flatten() },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }
    const product = await productService.updateProduct(parseInt(id, 10), parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await productService.deleteProduct(parseInt(id, 10));
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  } catch (error) {
    return handleError(error);
  }
}

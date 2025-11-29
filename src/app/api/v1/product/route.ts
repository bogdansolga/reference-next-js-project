import { type NextRequest, NextResponse } from "next/server";
import { HTTP_STATUS } from "@/lib/core/http/constants";
import { handleError } from "@/lib/core/http/errorHandler";
import { Messages } from "@/lib/core/i18n/messages";
import { productService } from "@/lib/services/productService";
import { createProductSchema } from "@/lib/types/product";

export async function GET() {
  try {
    const products = await productService.getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: Messages.VALIDATION_FAILED, details: parsed.error.flatten() },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }
    const product = await productService.createProduct(parsed.data);
    return NextResponse.json(product, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    return handleError(error);
  }
}

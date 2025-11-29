import { Messages } from "@/lib/core/i18n/messages";
import { productRepository } from "@/lib/repositories/productRepository";
import { sectionRepository } from "@/lib/repositories/sectionRepository";
import type { CreateProductDto, ProductResponse, UpdateProductDto } from "@/lib/types/product";
import { NotFoundError } from "./sectionService";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const productService = {
  async getAllProducts(): Promise<ProductResponse[]> {
    const products = await productRepository.findAll();
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sectionId: p.sectionId,
    }));
  },

  async getProductById(id: number): Promise<ProductResponse> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      sectionId: product.sectionId,
    };
  },

  async createProduct(data: CreateProductDto): Promise<ProductResponse> {
    const section = await sectionRepository.findById(data.sectionId);
    if (!section) {
      throw new NotFoundError(Messages.SECTION_NOT_FOUND);
    }
    const product = await productRepository.create(data);
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      sectionId: product.sectionId,
    };
  },

  async updateProduct(id: number, data: UpdateProductDto): Promise<ProductResponse> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }
    if (data.sectionId) {
      const section = await sectionRepository.findById(data.sectionId);
      if (!section) {
        throw new NotFoundError(Messages.SECTION_NOT_FOUND);
      }
    }
    const product = await productRepository.update(id, data);
    if (!product) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      sectionId: product.sectionId,
    };
  },

  async deleteProduct(id: number): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(Messages.PRODUCT_NOT_FOUND);
    }
    await productRepository.delete(id);
  },
};

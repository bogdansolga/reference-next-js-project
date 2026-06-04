import { beforeEach, describe, expect, it, vi } from "vitest";
import { productRepository } from "@/lib/repositories/product-repository";
import { sectionRepository } from "@/lib/repositories/section-repository";
import { productService } from "@/lib/services/product-service";

vi.mock("@/lib/repositories/product-repository", () => ({
  productRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/repositories/section-repository", () => ({
  sectionRepository: {
    findById: vi.fn(),
  },
}));

describe("productService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createProduct validates section exists", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue(null);
    await expect(productService.createProduct({ name: "Test", price: 10, sectionId: 999 })).rejects.toThrow(
      "Section not found"
    );
  });

  it("createProduct creates product when valid", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue({ id: 1, name: "Electronics" });
    vi.mocked(productRepository.create).mockResolvedValue({
      id: 1,
      name: "Laptop",
      price: 999,
      sectionId: 1,
    });
    const result = await productService.createProduct({
      name: "Laptop",
      price: 999,
      sectionId: 1,
    });
    expect(result.id).toBe(1);
  });

  it("getProductById throws when not exists", async () => {
    vi.mocked(productRepository.findById).mockResolvedValue(null);
    await expect(productService.getProductById(999)).rejects.toThrow("Product not found");
  });
});

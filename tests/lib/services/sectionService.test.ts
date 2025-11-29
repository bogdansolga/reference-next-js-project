import { beforeEach, describe, expect, it, vi } from "vitest";
import { sectionRepository } from "@/lib/repositories/sectionRepository";
import { sectionService } from "@/lib/services/sectionService";

vi.mock("@/lib/repositories/sectionRepository", () => ({
  sectionRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}));

describe("sectionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllSections returns mapped sections", async () => {
    vi.mocked(sectionRepository.findAll).mockResolvedValue([{ id: 1, name: "Electronics" }]);
    const result = await sectionService.getAllSections();
    expect(result).toEqual([{ id: 1, name: "Electronics" }]);
  });

  it("getSectionById returns section when exists", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue({ id: 1, name: "Electronics" });
    const result = await sectionService.getSectionById(1);
    expect(result).toEqual({ id: 1, name: "Electronics" });
  });

  it("getSectionById throws when not exists", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue(null);
    await expect(sectionService.getSectionById(1)).rejects.toThrow("Section not found");
  });
});

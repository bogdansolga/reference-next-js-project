import { beforeEach, describe, expect, it, vi } from "vitest";
import { sectionRepository } from "@/lib/repositories/sectionRepository";
import { sectionService } from "@/lib/services/sectionService";

vi.mock("@/lib/repositories/sectionRepository", () => ({
  sectionRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

  it("createSection creates and returns section", async () => {
    vi.mocked(sectionRepository.create).mockResolvedValue({ id: 1, name: "New Section" });
    const result = await sectionService.createSection({ name: "New Section" });
    expect(result).toEqual({ id: 1, name: "New Section" });
  });

  it("updateSection updates and returns section", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue({ id: 1, name: "Old" });
    vi.mocked(sectionRepository.update).mockResolvedValue({ id: 1, name: "Updated" });
    const result = await sectionService.updateSection(1, { name: "Updated" });
    expect(result).toEqual({ id: 1, name: "Updated" });
  });

  it("updateSection throws when not exists", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue(null);
    await expect(sectionService.updateSection(1, { name: "Updated" })).rejects.toThrow("Section not found");
  });

  it("deleteSection deletes section", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue({ id: 1, name: "Electronics" });
    vi.mocked(sectionRepository.delete).mockResolvedValue();
    await expect(sectionService.deleteSection(1)).resolves.toBeUndefined();
  });

  it("deleteSection throws when not exists", async () => {
    vi.mocked(sectionRepository.findById).mockResolvedValue(null);
    await expect(sectionService.deleteSection(1)).rejects.toThrow("Section not found");
  });
});

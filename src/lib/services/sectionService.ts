import { Messages } from "@/lib/core/i18n/messages";
import { sectionRepository } from "@/lib/repositories/sectionRepository";
import type { SectionResponse } from "@/lib/types/section";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const sectionService = {
  async getAllSections(): Promise<SectionResponse[]> {
    const sections = await sectionRepository.findAll();
    return sections.map((s) => ({ id: s.id, name: s.name }));
  },

  async getSectionById(id: number): Promise<SectionResponse> {
    const section = await sectionRepository.findById(id);
    if (!section) {
      throw new NotFoundError(Messages.SECTION_NOT_FOUND);
    }
    return { id: section.id, name: section.name };
  },
};

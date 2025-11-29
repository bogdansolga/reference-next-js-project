import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { sectionService } from "@/lib/services/sectionService";

async function SectionList() {
  await connection();
  const sections = await sectionService.getAllSections();

  if (sections.length === 0) {
    return <p className="text-zinc-500">No sections found.</p>;
  }

  return (
    <ul className="space-y-2">
      {sections.map((section) => (
        <li key={section.id} className="p-3 border rounded-md dark:border-zinc-700">
          {section.name}
        </li>
      ))}
    </ul>
  );
}

export default function SectionsPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Sections</h1>
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back
        </Link>
      </div>

      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <SectionList />
      </Suspense>
    </main>
  );
}

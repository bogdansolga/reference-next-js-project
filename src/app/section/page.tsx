import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import type { SectionResponse } from "@/lib/types/section";

async function SectionList() {
  const cookieStore = await cookies();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/v1/section`, {
    headers: { Cookie: cookieStore.toString() },
  });
  const sections: SectionResponse[] = response.ok ? await response.json() : [];

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

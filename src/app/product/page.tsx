import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { productService } from "@/lib/services/productService";

async function ProductList() {
  await connection();
  const products = await productService.getAllProducts();

  if (products.length === 0) {
    return <p className="text-zinc-500">No products found.</p>;
  }

  return (
    <ul className="space-y-2">
      {products.map((product) => (
        <li key={product.id} className="p-3 border rounded-md dark:border-zinc-700 flex justify-between items-center">
          <span>{product.name}</span>
          <span className="text-zinc-600 dark:text-zinc-400">${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back
        </Link>
      </div>

      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <ProductList />
      </Suspense>
    </main>
  );
}

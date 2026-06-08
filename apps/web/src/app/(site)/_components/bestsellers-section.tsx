import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

export async function BestsellersSection() {
  let products: ProductCardData[] = [];

  try {
    const data = await serverFetch<ProductsResponse>(
      "/products?limit=8&sort=bestseller",
      { next: { revalidate: 120, tags: ["products"] } }
    );
    products = data.products;
  } catch (e) {
    console.error("Failed to fetch bestsellers:", e);
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, i) => (
        <ProductCard
          key={product.slug}
          product={product}
          variant="default"
          priority={i < 4}
        />
      ))}
    </div>
  );
}

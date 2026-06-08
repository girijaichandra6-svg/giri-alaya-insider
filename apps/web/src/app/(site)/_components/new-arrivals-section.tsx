import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

export async function NewArrivalsSection() {
  let products: ProductCardData[] = [];

  try {
    const data = await serverFetch<ProductsResponse>(
      "/products?limit=8&sort=newest",
      { next: { revalidate: 120, tags: ["products"] } }
    );
    products = data.products.map((p) => ({ ...p, isNew: true }));
  } catch (e) {
    console.error("Failed to fetch new arrivals:", e);
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          variant="default"
        />
      ))}
    </div>
  );
}

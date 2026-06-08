import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { TrendingCarousel } from "./trending-carousel";

export async function TrendingSection() {
  let products: ProductsResponse["products"] = [];

  try {
    const data = await serverFetch<ProductsResponse>(
      "/products?limit=12&sort=trending",
      { next: { revalidate: 60, tags: ["products"] } }
    );
    products = data.products;
  } catch (e) {
    console.error("Failed to fetch trending products:", e);
  }

  if (products.length === 0) return null;

  return <TrendingCarousel products={products} />;
}

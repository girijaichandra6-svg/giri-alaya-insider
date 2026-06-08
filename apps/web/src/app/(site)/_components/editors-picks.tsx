import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { EditorsPicksGrid } from "./editors-picks-grid";

export async function EditorsPicks() {
  let products: ProductsResponse["products"] = [];

  try {
    const data = await serverFetch<ProductsResponse>(
      "/products?limit=4&badge=Editor%27s%20Pick",
      { next: { revalidate: 120, tags: ["products"] } }
    );
    products = data.products;
  } catch (e) {
    console.error("Failed to fetch editor's picks:", e);
  }

  if (products.length === 0) return null;

  return <EditorsPicksGrid products={products} />;
}

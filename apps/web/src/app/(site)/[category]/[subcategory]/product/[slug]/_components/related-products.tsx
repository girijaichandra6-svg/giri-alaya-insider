import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

interface RelatedProductsProps {
  categorySlug: string;
  currentProductId: string;
}

export async function RelatedProducts({
  categorySlug,
  currentProductId,
}: RelatedProductsProps) {
  let products: ProductCardData[] = [];

  try {
    const data = await serverFetch<ProductsResponse>(
      `/products?category=${categorySlug}&limit=8`,
      { next: { revalidate: 300 } }
    );
    products = data.products.filter((p) => p.id !== currentProductId).slice(0, 4);
  } catch {
    return null;
  }

  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-medium mb-8">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
}

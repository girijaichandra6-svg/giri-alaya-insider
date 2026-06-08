import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

interface CategoryProductsProps {
  categorySlug: string;
  sort: string;
  page: number;
  subcategory?: string;
}

export async function CategoryProducts({
  categorySlug,
  sort,
  page,
  subcategory,
}: CategoryProductsProps) {
  let data: ProductsResponse | null = null;

  const params = new URLSearchParams({
    category: categorySlug,
    sort,
    page: String(page),
    limit: "24",
  });
  if (subcategory) {
    params.set("subcategory", subcategory);
  }

  try {
    data = await serverFetch<ProductsResponse>(
      `/products?${params.toString()}`,
      { next: { revalidate: 120, tags: [`category-${categorySlug}`] } }
    );
  } catch (e) {
    console.error("Failed to fetch category products:", e);
  }

  if (!data || data.products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted font-body">
          {subcategory
            ? "No products found in this subcategory."
            : "No products found in this category."}
        </p>
      </div>
    );
  }

  const products: ProductCardData[] = data.products;
  const basePath = `/${categorySlug}`;

  function buildPageUrl(p: number): string {
    const sp = new URLSearchParams();
    sp.set("sort", sort);
    sp.set("page", String(p));
    if (subcategory) sp.set("subcategory", subcategory);
    return `${basePath}?${sp.toString()}`;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            variant="default"
          />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <a
                key={p}
                href={buildPageUrl(p)}
                className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-ui transition-colors ${
                  p === page
                    ? "bg-accent text-obsidian"
                    : "text-muted hover:text-softWhite border border-white/10 hover:border-white/20"
                }`}
              >
                {p}
              </a>
            )
          )}
        </div>
      )}
    </>
  );
}

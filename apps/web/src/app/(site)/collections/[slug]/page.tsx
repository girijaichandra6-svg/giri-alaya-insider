import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import type { ProductsResponse } from "@/lib/api";
import { HeroBanner } from "@/components/shared/hero-banner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

const collections: Record<string, { title: string; description: string; accentColor: string }> = {
  "editors-picks": {
    title: "Editor's Picks",
    description: "Our editors' hand-picked selection of the finest products across every category.",
    accentColor: "#D4FF00",
  },
  "gift-guides": {
    title: "Gift Guides",
    description: "Curated gifting inspiration for every occasion and budget.",
    accentColor: "#FFB6C1",
  },
  "best-sellers": {
    title: "Best Sellers",
    description: "The most popular products loved by our community.",
    accentColor: "#FFA07A",
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "The latest additions to our curated catalog.",
    accentColor: "#87CEEB",
  },
  "trending": {
    title: "Trending Now",
    description: "What everyone's talking about — the products making waves.",
    accentColor: "#FF3366",
  },
};

export function generateStaticParams() {
  return Object.keys(collections).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collections[slug];
  if (!collection) return {};
  return {
    title: `${collection.title} | ALAYA INSIDER`,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collections[slug];
  if (!collection) notFound();

  let products: ProductCardData[] = [];
  try {
    const data = await serverFetch<ProductsResponse>(
      `/products?limit=24&collection=${slug}`,
      { next: { revalidate: 120 } }
    );
    products = data.products;
  } catch {
    // Fallback
  }

  return (
    <main>
      <HeroBanner
        title={collection.title}
        description={collection.description}
        accentColor={collection.accentColor}
        badge="Collection"
        size="md"
        align="left"
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumbs items={[{ label: "Collections" }, { label: collection.title }]} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {products.length === 0 ? (
          <p className="text-center text-muted py-20 font-body">
            No products in this collection yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

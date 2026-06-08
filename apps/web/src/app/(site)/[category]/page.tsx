import Link from "next/link";
import { Suspense } from "react";
import { categories } from "@alaya/config";
import { notFound } from "next/navigation";
import { prisma } from "@alaya/db/client";
import { siteConfig } from "@alaya/config/site";
import { JsonLd } from "@/components/shared/json-ld";
import { HeroBanner } from "@/components/shared/hero-banner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { CategoryProducts } from "./_components/category-products";
import { CategoryFilters } from "./_components/category-filters";
import { SubcategoryBreadcrumb } from "./_components/subcategory-breadcrumb";
import { ProductCount } from "./_components/product-count";

const categoryImages: Record<string, string> = {
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80",
  "home-living": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80",
  travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80",
  "health-wellness": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80",
  "food-nutrition": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80",
};

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = categories[slug];
  if (!cat) return {};

  return {
    title: `${cat.name} | ALAYA INSIDER`,
    description: cat.description,
    openGraph: {
      title: `${cat.name} | ALAYA INSIDER`,
      description: cat.description,
      images: [{ url: categoryImages[slug] || "", width: 1200, height: 630 }],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; page?: string; subcategory?: string }>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const cat = categories[slug];
  if (!cat) notFound();

  const sort = sp.sort || "newest";
  const page = parseInt(sp.page || "1");
  const subcategory = sp.subcategory;

  // Look up subcategory name for breadcrumb
  const subcategoryName =
    subcategory
      ? (await prisma.subcategory.findUnique({
          where: { slug: subcategory },
          select: { name: true },
        }))?.name ?? null
      : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: cat.name,
        item: `${siteConfig.url}/${slug}`,
      },
      ...(subcategoryName
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: subcategoryName,
              item: `${siteConfig.url}/${slug}?subcategory=${subcategory}`,
            },
          ]
        : []),
    ],
  };

  return (
    <main>
      <JsonLd schema={breadcrumbSchema} />
      {/* Hero Banner */}
      <HeroBanner
        title={cat.name}
        description={cat.description}
        accentColor={cat.accentColor}
        imageUrl={categoryImages[slug]}
        badge="Collection"
        size="md"
        align="left"
      />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumbs items={[{ label: cat.name }]}>
          <SubcategoryBreadcrumb
            categorySlug={slug}
            subcategorySlug={subcategory}
            subcategoryName={subcategoryName}
          />
        </Breadcrumbs>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <CategoryFilters
                categorySlug={slug}
                accentColor={cat.accentColor}
                currentSubcategory={subcategory}
                currentSort={sort}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-8">
              <Suspense
                fallback={
                  <p className="text-sm text-muted font-body">
                    Loading products&hellip;
                  </p>
                }
              >
                <ProductCount
                  categorySlug={slug}
                  subcategorySlug={subcategory}
                />
              </Suspense>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${slug}?sort=newest`}
                  className={`text-sm font-ui px-3 py-1.5 rounded-lg transition-colors ${
                    sort === "newest"
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-softWhite"
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={`/${slug}?sort=price_asc`}
                  className={`text-sm font-ui px-3 py-1.5 rounded-lg transition-colors ${
                    sort === "price_asc"
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-softWhite"
                  }`}
                >
                  Price: Low
                </Link>
                <Link
                  href={`/${slug}?sort=price_desc`}
                  className={`text-sm font-ui px-3 py-1.5 rounded-lg transition-colors ${
                    sort === "price_desc"
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-softWhite"
                  }`}
                >
                  Price: High
                </Link>
                <Link
                  href={`/${slug}?sort=rating`}
                  className={`text-sm font-ui px-3 py-1.5 rounded-lg transition-colors ${
                    sort === "rating"
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-softWhite"
                  }`}
                >
                  Top Rated
                </Link>
              </div>
            </div>

            {/* Product Grid */}
            <Suspense
              fallback={
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] rounded-xl bg-graphite animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <CategoryProducts
                categorySlug={slug}
                sort={sort}
                page={page}
                subcategory={subcategory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

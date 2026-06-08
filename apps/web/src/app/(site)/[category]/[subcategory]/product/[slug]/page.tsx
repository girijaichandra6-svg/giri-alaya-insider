import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import type { ProductDetail } from "@/lib/api";
import { JsonLd } from "@/components/shared/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGallery } from "./_components/product-gallery";
import { PriceComparison } from "./_components/price-comparison";
import { ProductReviews } from "./_components/product-reviews";
import { ProductQA } from "./_components/product-qa";
import { RelatedProducts } from "./_components/related-products";
import { ProductInfo } from "./_components/product-info";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { siteConfig } from "@alaya/config/site";

function buildProductSchema(product: ProductDetail): Record<string, unknown> {
  const url = `${siteConfig.url}/${product.category.slug}/${product.subcategory?.slug ?? "unknown"}/product/${product.slug}`;

  const offers = product.affiliateLinks.map((link) => ({
    "@type": "Offer",
    url: link.url,
    priceCurrency: product.currency,
    price: product.basePrice ? Number(product.basePrice).toString() : undefined,
    seller: {
      "@type": "Organization",
      name: link.retailer.name,
    },
    availability: "https://schema.org/InStock",
  }));

  const avgScore = product.productScores?.[0]?.score ?? 0;
  const aggregateRating =
    avgScore > 0 && product.reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: avgScore.toFixed(1),
          reviewCount: product.reviews.length,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined;

  const reviews = product.reviews.map((review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: "5",
    },
    author: {
      "@type": "Person",
      name: review.user.name ?? "Anonymous",
    },
    ...(review.body ? { reviewBody: review.body } : {}),
    ...(review.createdAt ? { datePublished: review.createdAt.split("T")[0] } : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    ...(product.imageUrls?.length ? { image: product.imageUrls } : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    sku: product.slug,
    category: product.category.name,
    url,
    ...(offers.length > 0 ? { offers } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviews.length > 0 ? { review: reviews } : {}),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
}) {
  const { slug } = await params;
  try {
    const product = await serverFetch<ProductDetail>(`/products?slug=${slug}`);
    return {
      title: `${product.title} | ALAYA INSIDER`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.title,
        description: product.description.slice(0, 160),
        images: product.imageUrls?.[0] ? [{ url: product.imageUrls[0] }] : [],
      },
    };
  } catch {
    return { title: "Product | ALAYA INSIDER" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
}) {
  const { slug } = await params;

  let product: ProductDetail;
  try {
    product = await serverFetch<ProductDetail>(`/products?slug=${slug}`, {
      next: { revalidate: 300, tags: [`product-${slug}`] },
    });
  } catch {
    notFound();
  }

  return (
    <main className="pt-24">
      <JsonLd schema={buildProductSchema(product)} />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumbs
          items={[
            { label: product.category.name, href: `/${product.category.slug}` },
            ...(product.subcategory
              ? [{ label: product.subcategory.name }]
              : []),
            { label: product.title },
          ]}
        />
      </div>

      {/* Product Main Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <ProductGallery images={product.imageUrls} title={product.title} />

          {/* Product Info & Buy Box */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Price Comparison */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Suspense fallback={<div className="h-48 rounded-xl bg-graphite animate-pulse" />}>
          <PriceComparison
            affiliateLinks={product.affiliateLinks}
            currency={product.currency}
          />
        </Suspense>
      </div>

      <Separator />

      {/* Reviews */}
      <div className="max-w-7xl mx-auto px-6 py-16" id="reviews">
        <Suspense fallback={<div className="h-64 rounded-xl bg-graphite animate-pulse" />}>
          <ProductReviews
            reviews={product.reviews}
            productId={product.id}
          />
        </Suspense>
      </div>

      <Separator />

      {/* Q&A */}
      <div className="max-w-7xl mx-auto px-6 py-16" id="qa">
        <Suspense fallback={null}>
          <ProductQA productId={product.id} />
        </Suspense>
      </div>

      <Separator />

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Suspense fallback={null}>
          <RelatedProducts
            categorySlug={product.category.slug}
            currentProductId={product.id}
          />
        </Suspense>
      </div>

      {/* Affiliate Disclosure */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-xs text-muted/50 font-body text-center">
            ALAYA INSIDER participates in affiliate programs. When you purchase
            through links on our site, we may earn a commission.
          </p>
        </div>
      </div>
    </main>
  );
}

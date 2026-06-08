import Link from "next/link";
import { prisma } from "@alaya/db/client";
import { siteConfig } from "@alaya/config/site";
import { formatDate } from "@alaya/utils";
import { JsonLd } from "@/components/shared/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";

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
      name: "Guides",
      item: `${siteConfig.url}/guides`,
    },
  ],
};

export const metadata = {
  title: "Guides | ALAYA INSIDER",
  description:
    "In-depth buying guides, how-to articles, and expert advice for luxury lifestyle shopping.",
};

export default async function GuidesPage() {
  const guides = await prisma.post.findMany({
    where: { status: "PUBLISHED", type: "GUIDE" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      type: true,
      publishedAt: true,
      author: { select: { name: true } },
      category: { select: { name: true, accentColor: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  return (
    <main className="pt-24">
      <JsonLd schema={breadcrumbSchema} />

      {/* Header */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Guides" }]} />
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mt-8">
            Buying Guides
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl font-body">
            In-depth buying guides, how-to articles, and expert advice to help
            you make informed luxury purchasing decisions.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {guides.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted font-body text-lg">
                No guides yet. Check back soon for new content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/blog/${guide.slug}`}
                  className="group block rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 bg-graphite/30 overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/9] bg-onyx relative overflow-hidden">
                    {guide.coverImageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${guide.coverImageUrl})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-heading text-muted/20">
                          G
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {guide.type && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase tracking-wider"
                        >
                          {guide.type}
                        </Badge>
                      )}
                      {guide.category && (
                        <span
                          className="text-[10px] font-ui font-semibold uppercase tracking-wider"
                          style={{ color: guide.category.accentColor }}
                        >
                          {guide.category.name}
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-xl font-medium text-softWhite group-hover:text-accent transition-colors mb-2 line-clamp-2">
                      {guide.title}
                    </h2>

                    {guide.excerpt && (
                      <p className="text-sm text-muted font-body line-clamp-2 leading-relaxed">
                        {guide.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-4 text-xs text-muted font-body">
                      {guide.author?.name && (
                        <span>By {guide.author.name}</span>
                      )}
                      {guide.publishedAt && (
                        <time dateTime={guide.publishedAt.toISOString()}>
                          {formatDate(guide.publishedAt)}
                        </time>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

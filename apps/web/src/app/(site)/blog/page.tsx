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
      name: "Blog",
      item: `${siteConfig.url}/blog`,
    },
  ],
};

export const metadata = {
  title: "Blog | ALAYA INSIDER",
  description:
    "Expert insights, luxury shopping guides, and curated stories from the world of premium lifestyle.",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", type: { not: "GUIDE" } },
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
          <Breadcrumbs items={[{ label: "Blog" }]} />
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mt-8">
            Blog & Guides
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl font-body">
            Expert insights, luxury shopping guides, and curated stories from
            the world of premium lifestyle.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted font-body text-lg">
                No posts yet. Check back soon for new content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 bg-graphite/30 overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/9] bg-onyx relative overflow-hidden">
                    {post.coverImageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${post.coverImageUrl})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-heading text-muted/20">
                          A
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.type && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase tracking-wider"
                        >
                          {post.type}
                        </Badge>
                      )}
                      {post.category && (
                        <span
                          className="text-[10px] font-ui font-semibold uppercase tracking-wider"
                          style={{ color: post.category.accentColor }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-xl font-medium text-softWhite group-hover:text-accent transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-muted font-body line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-4 text-xs text-muted font-body">
                      {post.author?.name && (
                        <span>By {post.author.name}</span>
                      )}
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                          {formatDate(post.publishedAt)}
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

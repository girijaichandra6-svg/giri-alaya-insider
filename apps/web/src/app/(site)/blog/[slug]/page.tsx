import { notFound } from "next/navigation";
import { prisma } from "@alaya/db/client";
import { siteConfig } from "@alaya/config/site";
import { formatDate } from "@alaya/utils";
import { JsonLd } from "@/components/shared/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverImageUrl: true, publishedAt: true },
  });

  if (!post) return {};

  return {
    title: `${post.title} | ALAYA INSIDER Blog`,
    description: post.excerpt ?? post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article" as const,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      category: { select: { name: true, slug: true, accentColor: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    datePublished: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : {
          "@type": "Organization",
          name: siteConfig.name,
        },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.ogImage}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteConfig.url}/blog/${post.slug}`,
      },
    ],
  };

  // Estimate read time (rough: 200 words per minute)
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="pt-24">
      <JsonLd schema={[articleSchema, breadcrumbSchema]} useGraph />

      {/* Back link + Breadcrumbs */}
      <div className="max-w-3xl mx-auto px-6 pb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-softWhite transition-colors font-body mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />
      </div>

      <article className="max-w-3xl mx-auto px-6 pb-24">
        {/* Header */}
        <header className="mb-10">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            {post.type && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
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

          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg text-muted font-body leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted font-body">
            {post.author?.name && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <time
                className="flex items-center gap-1.5"
                dateTime={post.publishedAt.toISOString()}
              >
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </time>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden">
            <div
              className="aspect-[2/1] bg-cover bg-center"
              style={{ backgroundImage: `url(${post.coverImageUrl})` }}
            />
          </div>
        )}

        {/* Content */}
        {post.content ? (
          <div
            className="prose prose-invert max-w-none
              prose-headings:font-heading prose-headings:font-medium prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-softWhite/80 prose-p:leading-relaxed prose-p:font-body
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-softWhite
              prose-ul:my-4 prose-li:text-softWhite/80
              prose-blockquote:border-l-accent prose-blockquote:bg-accent/5 prose-blockquote:py-2 prose-blockquote:px-4
              prose-code:text-accent prose-code:bg-graphite prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-muted font-body">No content available.</p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <>
            <Separator className="my-10" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t.tag.name} variant="outline" className="text-xs">
                  #{t.tag.name}
                </Badge>
              ))}
            </div>
          </>
        )}
      </article>
    </main>
  );
}

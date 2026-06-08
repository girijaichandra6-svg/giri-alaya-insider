import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@alaya/db/client";
import { formatCurrency } from "@alaya/utils";
import { Globe, Lock, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EditWishlistDialog } from "./_components/edit-wishlist-dialog";
import { RemoveProductButton } from "./_components/remove-product-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const wishlist = await prisma.wishlist.findUnique({
    where: { id },
    select: { name: true },
  });

  if (!wishlist) {
    return { title: "Wishlist | ALAYA INSIDER" };
  }

  return {
    title: `${wishlist.name} | ALAYA INSIDER`,
    robots: { index: false, follow: false },
  };
}

export default async function WishlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/?sign-in=true");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) redirect("/?sign-in=true");

  const wishlist = await prisma.wishlist.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { addedAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              brand: true,
              description: true,
              imageUrls: true,
              basePrice: true,
              currency: true,
              category: {
                select: { slug: true, name: true, accentColor: true },
              },
            },
          },
        },
      },
    },
  });

  if (!wishlist || wishlist.userId !== user.id) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Wishlists", href: "/user/wishlists" },
            { label: wishlist.name },
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading text-2xl font-medium">
              {wishlist.name}
            </h1>
            {wishlist.isPublic ? (
              <span className="flex items-center gap-1 text-xs text-muted font-body bg-white/5 px-2 py-1 rounded-full">
                <Globe className="h-3 w-3" />
                Public
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted font-body bg-white/5 px-2 py-1 rounded-full">
                <Lock className="h-3 w-3" />
                Private
              </span>
            )}
          </div>
          <p className="text-sm text-muted font-body">
            {wishlist.products.length}{" "}
            {wishlist.products.length === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/user/wishlists"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-softWhite transition-colors font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <EditWishlistDialog
            wishlistId={wishlist.id}
            initialName={wishlist.name}
            initialIsPublic={wishlist.isPublic}
          />
        </div>
      </div>

      {/* Products Grid */}
      {wishlist.products.length === 0 ? (
        <div className="p-16 rounded-xl border border-white/10 bg-graphite/30 text-center">
          <Package className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-body mb-2">
            This wishlist is empty.
          </p>
          <p className="text-sm text-muted/60 font-body mb-6">
            Browse products and add them to this wishlist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-ui"
          >
            Discover Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wishlist.products.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-graphite/30 hover:bg-graphite/50 transition-all group"
            >
              {/* Product thumbnail */}
              <Link
                href={`/${item.product.category.slug}/${item.product.slug}`}
                className="w-16 h-16 rounded-lg bg-onyx overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-accent/50 transition-all"
              >
                <span className="text-xs text-muted font-ui text-center px-1 leading-tight">
                  {item.product.brand?.[0] ?? item.product.title[0]}
                </span>
              </Link>

              {/* Product info */}
              <Link
                href={`/${item.product.category.slug}/${item.product.slug}`}
                className="flex-1 min-w-0"
              >
                <p className="font-ui text-sm font-medium text-softWhite group-hover:text-accent transition-colors truncate">
                  {item.product.title}
                </p>
                <p className="text-xs text-muted font-body mt-0.5">
                  {item.product.brand ?? item.product.category.name}
                </p>
                {item.product.basePrice && (
                  <p className="text-xs text-softWhite font-ui font-semibold mt-1">
                    {formatCurrency(
                      Number(item.product.basePrice),
                      item.product.currency
                    )}
                  </p>
                )}
              </Link>

              {/* Remove button */}
              <RemoveProductButton
                wishlistId={wishlist.id}
                productId={item.product.id}
                productTitle={item.product.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@alaya/db/client";
import { Heart, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { CreateWishlistForm } from "./_components/create-wishlist-form";
import { DeleteWishlistButton } from "./_components/delete-wishlist-button";

export default async function WishlistsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/?sign-in=true");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) redirect("/?sign-in=true");

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
    include: {
      products: {
        take: 4,
        orderBy: { addedAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              imageUrls: true,
              basePrice: true,
              currency: true,
              brand: true,
              category: { select: { slug: true, name: true, accentColor: true } },
            },
          },
        },
      },
      _count: { select: { products: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-medium">My Wishlists</h1>
          <p className="text-sm text-muted font-body mt-1">
            Save and organize your favourite products
          </p>
        </div>
        <CreateWishlistForm />
      </div>

      {wishlists.length === 0 ? (
        <div className="p-12 rounded-xl border border-white/10 bg-graphite/30 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-body mb-2">
            You haven&apos;t created any wishlists yet.
          </p>
          <p className="text-sm text-muted/60 font-body mb-6">
            Create your first wishlist to start saving products.
          </p>
          <CreateWishlistForm variant="button" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlists.map((wishlist) => (
            <div
              key={wishlist.id}
              className="rounded-xl border border-white/10 bg-graphite/30 hover:bg-graphite/50 transition-all group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/user/wishlists/${wishlist.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h2 className="font-heading text-lg font-medium text-softWhite group-hover:text-accent transition-colors truncate">
                      {wishlist.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted font-body">
                        {wishlist._count.products}{" "}
                        {wishlist._count.products === 1 ? "item" : "items"}
                      </span>
                      {wishlist.isPublic ? (
                        <span className="flex items-center gap-1 text-xs text-muted font-body">
                          <Globe className="h-3 w-3" />
                          Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted font-body">
                          <Lock className="h-3 w-3" />
                          Private
                        </span>
                      )}
                    </div>
                  </Link>
                  <DeleteWishlistButton wishlistId={wishlist.id} wishlistName={wishlist.name} />
                </div>

                {/* Product Thumbnails */}
                {wishlist.products.length > 0 ? (
                  <div className="flex gap-2">
                    {wishlist.products.map((item) => (
                      <Link
                        key={item.product.id}
                        href={`/${item.product.category.slug}/${item.product.slug}`}
                        className="block w-16 h-16 rounded-lg bg-onyx overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-accent/50 transition-all"
                      >
                        <span className="text-[10px] text-muted font-ui text-center px-1 leading-tight">
                          {item.product.brand?.[0] ?? item.product.title[0]}
                        </span>
                      </Link>
                    ))}
                    {wishlist._count.products > 4 && (
                      <div className="w-16 h-16 rounded-lg bg-onyx flex items-center justify-center">
                        <span className="text-xs text-muted font-ui">
                          +{wishlist._count.products - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted font-body">
                    No products yet. Browse and save your favourites.
                  </p>
                )}

                {/* View all link */}
                {wishlist._count.products > 0 && (
                  <Link
                    href={`/user/wishlists/${wishlist.id}`}
                    className="inline-flex items-center gap-1 mt-4 text-xs text-accent hover:underline font-ui"
                  >
                    View all products &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

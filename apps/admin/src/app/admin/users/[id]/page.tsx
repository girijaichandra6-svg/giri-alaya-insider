import { notFound } from "next/navigation";
import { prisma } from "@alaya/db/client";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageSquare, Star, FileText, Ban, Shield } from "lucide-react";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-white/5 text-muted",
  EDITOR: "bg-cyan-500/10 text-cyan-400",
  ADMIN: "bg-amber-500/10 text-amber-400",
  SUPER_ADMIN: "bg-coral/10 text-coral",
};

export async function generateMetadata({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true },
  });

  if (!user) {
    return { title: "User Not Found | ALAYA INSIDER Admin" };
  }

  return {
    title: `${user.name || user.email} | ALAYA INSIDER Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      language: true,
      country: true,
      deletedAt: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          reviews: true,
          comments: true,
          wishlists: true,
          savedProducts: true,
        },
      },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          category: { select: { name: true, accentColor: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          product: { select: { slug: true, title: true } },
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          body: true,
          createdAt: true,
          post: { select: { slug: true, title: true } },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isBanned = !!user.deletedAt;

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-softWhite transition-colors font-ui mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* Profile Card */}
      <div className="rounded-xl border border-white/10 bg-obsidian p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-onyx flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl text-muted font-ui">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading text-2xl font-medium">
                {user.name || "Unnamed User"}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-ui font-semibold ${
                  ROLE_STYLES[user.role] || ROLE_STYLES.USER
                }`}
              >
                {user.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </span>
              {isBanned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-ui font-semibold bg-coral/10 text-coral">
                  <Ban className="h-3 w-3" />
                  Banned
                </span>
              )}
            </div>
            <p className="text-sm text-muted font-body mt-1">{user.email}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted font-body">
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              {user.country && <span>Country: {user.country}</span>}
              {user.language && <span>Language: {user.language.toUpperCase()}</span>}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {[
            { label: "Posts", value: user._count.posts, icon: FileText },
            { label: "Reviews", value: user._count.reviews, icon: Star },
            { label: "Comments", value: user._count.comments, icon: MessageSquare },
            { label: "Wishlists", value: user._count.wishlists, icon: Shield },
            { label: "Saved", value: user._count.savedProducts, icon: ExternalLink },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-onyx p-3 text-center"
            >
              <stat.icon className="h-4 w-4 mx-auto text-muted mb-1" />
              <p className="text-xl font-ui font-bold text-softWhite">{stat.value}</p>
              <p className="text-[10px] text-muted font-ui mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts */}
        <div className="rounded-xl border border-white/10 bg-obsidian p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-base font-medium">Recent Posts</h2>
          </div>
          {user.posts.length === 0 ? (
            <p className="text-sm text-muted font-body py-6 text-center">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {user.posts.map((post) => (
                <div key={post.id} className="rounded-lg bg-onyx p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-softWhite font-body truncate flex-1">
                      {post.title}
                    </p>
                    <span className="text-[10px] text-muted font-ui shrink-0 uppercase">
                      {post.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {post.category && (
                      <span
                        className="text-[10px] font-ui font-medium"
                        style={{ color: post.category.accentColor }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-ui font-semibold ${
                        post.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : post.status === "DRAFT"
                          ? "bg-white/5 text-muted"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted font-body mt-1">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="rounded-xl border border-white/10 bg-obsidian p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-base font-medium">Recent Reviews</h2>
          </div>
          {user.reviews.length === 0 ? (
            <p className="text-sm text-muted font-body py-6 text-center">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {user.reviews.map((review) => (
                <div key={review.id} className="rounded-lg bg-onyx p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < review.rating ? "text-amber-400" : "text-white/10"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted font-ui">{review.rating}/5</span>
                  </div>
                  <p className="text-sm font-medium text-softWhite font-body truncate">
                    {review.title || "Untitled"}
                  </p>
                  <p className="text-xs text-muted font-body mt-0.5 line-clamp-2">
                    {review.body}
                  </p>
                  <p className="text-[10px] text-muted font-body mt-1">
                    on {review.product.title} &middot; {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="rounded-xl border border-white/10 bg-obsidian p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-base font-medium">Recent Comments</h2>
          </div>
          {user.comments.length === 0 ? (
            <p className="text-sm text-muted font-body py-6 text-center">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {user.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-onyx p-3">
                  <p className="text-xs text-muted font-body line-clamp-3">
                    {comment.body}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {comment.post ? (
                      <span className="text-[10px] font-ui text-muted truncate">
                        on &ldquo;{comment.post.title}&rdquo;
                      </span>
                    ) : (
                      <span className="text-[10px] font-ui text-muted">on a review</span>
                    )}
                    <span className="text-[10px] text-muted font-body ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

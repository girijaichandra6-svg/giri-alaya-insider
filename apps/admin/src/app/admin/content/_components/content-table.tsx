"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { EditContentDialog } from "./edit-content-dialog";
import { DeleteContentButton } from "./delete-content-button";
import { BulkActionsBar } from "./bulk-actions-bar";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  type: string;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; accentColor: string } | null;
  author: { name: string | null } | null;
  _count: { comments: number };
}

interface ContentTableProps {
  posts: PostRow[];
  query: string;
  statusFilter: string;
  page: number;
  totalPages: number;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-white/5 text-muted",
  REVIEW: "bg-amber-500/10 text-amber-400",
  PUBLISHED: "bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "bg-white/5 text-muted line-through",
};

const ALL_STATUSES = ["all", "DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;

function buildUrl(
  params: Record<string, string | undefined>,
  currentQuery: string,
  currentStatus: string
) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (params.status || currentStatus !== "all")
    sp.set("status", params.status || currentStatus);
  if (params.page) sp.set("page", params.page);
  const qs = sp.toString();
  return `/admin/content${qs ? `?${qs}` : ""}`;
}

export function ContentTable({
  posts,
  query,
  statusFilter,
  page,
  totalPages,
}: ContentTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const allIds = React.useMemo(() => posts.map((p) => p.id), [posts]);
  const allSelected = posts.length > 0 && selectedIds.size === posts.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <>
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const q = formData.get("q") as string;
            const url = new URL(window.location.href);
            if (q) {
              url.searchParams.set("q", q);
            } else {
              url.searchParams.delete("q");
            }
            url.searchParams.delete("page");
            router.push(url.pathname + url.search);
          }}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search posts..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_STATUSES.map((s) => {
            const href = buildUrl({ status: s === "all" ? undefined : s, page: "1" }, query, statusFilter);
            return (
              <a
                key={s}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui transition-colors ${
                  statusFilter === s
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-softWhite hover:bg-white/5"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s] || s}
              </a>
            );
          })}
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        onClearSelection={clearSelection}
      />

      {/* Posts Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="w-12 px-4 py-3">
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-white/20 bg-onyx text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="sr-only">Select all</span>
                  </label>
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Author
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Published
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No posts matching "${query}"`
                      : "No posts yet."}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-white/5 transition-colors ${
                      selectedIds.has(post.id) ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="w-12 px-4 py-3">
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(post.id)}
                          onChange={() => toggleOne(post.id)}
                          className="h-4 w-4 rounded border-white/20 bg-onyx text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="sr-only">Select {post.title}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-softWhite font-body truncate max-w-[250px] lg:max-w-[400px]">
                          {post.title}
                        </p>
                        {post.excerpt && (
                          <p className="text-xs text-muted font-body mt-0.5 truncate max-w-[250px] lg:max-w-[400px]">
                            {post.excerpt}
                          </p>
                        )}
                        {post.category && (
                          <span
                            className="text-[10px] font-ui font-medium mt-1 inline-block"
                            style={{ color: post.category.accentColor }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted font-body uppercase tracking-wider">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted font-body">
                        {post.author?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold ${
                          STATUS_STYLES[post.status] || STATUS_STYLES.DRAFT
                        }`}
                      >
                        {STATUS_LABELS[post.status] || post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted font-body">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditContentDialog
                          postId={post.id}
                          initialTitle={post.title}
                          initialSlug={post.slug}
                          initialType={post.type}
                          initialStatus={post.status}
                          initialExcerpt={post.excerpt || ""}
                        />
                        <DeleteContentButton
                          postId={post.id}
                          postTitle={post.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted font-body">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={buildUrl({ page: String(page - 1) }, query, statusFilter)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <a
                  key={p}
                  href={buildUrl({ page: String(p) }, query, statusFilter)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-ui transition-colors ${
                    p === page
                      ? "bg-accent text-obsidian"
                      : "text-muted hover:text-softWhite hover:bg-white/5"
                  }`}
                >
                  {p}
                </a>
              );
            })}
            {page < totalPages && (
              <a
                href={buildUrl({ page: String(page + 1) }, query, statusFilter)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

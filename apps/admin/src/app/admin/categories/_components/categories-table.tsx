"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryButton } from "./delete-category-button";

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  accentColor: string;
  imageUrl: string | null;
  parentId: string | null;
  metadata: Record<string, unknown> | null;
  _count: { products: number; posts: number; children: number };
}

interface CategoriesTableProps {
  categories: CategoryRow[];
  query: string;
}

function buildTree(categories: CategoryRow[], parentId: string | null, depth: number = 0): CategoryRow[] {
  const result: CategoryRow[] = [];
  for (const cat of categories) {
    if (cat.parentId === parentId) {
      result.push({ ...cat, _depth: depth } as any);
      result.push(...buildTree(categories, cat.id, depth + 1));
    }
  }
  return result;
}

export function CategoriesTable({ categories, query }: CategoriesTableProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const tree = React.useMemo(() => buildTree(categories, null, 0), [categories]);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasChildren = (id: string) => categories.some((c) => c.parentId === id);
  const isCollapsed = (id: string) => collapsed.has(id);

  const visibleRows = tree.filter((cat: any) => {
    if (cat._depth === 0) return true;
    // Walk up to check if any ancestor is collapsed
    let ancestorId: string | null = cat.parentId;
    while (ancestorId) {
      const ancestor = categories.find((c) => c.id === ancestorId);
      if (!ancestor) break;
      if (collapsed.has(ancestor.id)) return false;
      ancestorId = ancestor.parentId;
    }
    return true;
  });

  return (
    <>
      {/* Search */}
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
            router.push(url.pathname + url.search);
          }}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search categories by name or slug..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
      </div>

      {/* Categories Tree Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Products
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Posts
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Subcats
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No categories matching "${query}"`
                      : "No categories yet."}
                  </td>
                </tr>
              ) : (
                visibleRows.map((cat: any) => {
                  const ch = hasChildren(cat.id);
                  const isCol = isCollapsed(cat.id);

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Indentation + expand/collapse */}
                          <div
                            className="flex items-center shrink-0"
                            style={{ paddingLeft: `${cat._depth * 20}px` }}
                          >
                            {ch ? (
                              <button
                                onClick={() => toggleCollapse(cat.id)}
                                className="p-0.5 text-muted hover:text-softWhite transition-colors"
                              >
                                {isCol ? (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4" />
                            )}
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.accentColor }}
                              title={`Accent: ${cat.accentColor}`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-softWhite font-body truncate max-w-[200px]">
                                {cat.name}
                              </p>
                              {cat.description && (
                                <p className="text-[10px] text-muted font-body truncate max-w-[200px]">
                                  {cat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted font-mono">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="text-xs text-softWhite font-body">
                          {cat._count.products}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="text-xs text-softWhite font-body">
                          {cat._count.posts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className="text-xs text-softWhite font-body">
                          {cat._count.children}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditCategoryDialog
                            category={cat}
                            categories={categories}
                          />
                          <DeleteCategoryButton
                            categoryId={cat.id}
                            categoryName={cat.name}
                            childCount={cat._count.children}
                            productCount={cat._count.products}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

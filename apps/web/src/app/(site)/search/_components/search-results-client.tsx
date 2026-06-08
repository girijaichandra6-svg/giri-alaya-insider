"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@alaya/utils";
import { useCurrency } from "@/stores/currency-store";
import { Search, FileText } from "lucide-react";
import { SearchSortDropdown } from "./search-sort";
import { SearchPagination } from "./search-pagination";

const ITEMS_PER_PAGE = 20;

interface SearchResultsClientProps {
  initialProducts: any[];
  initialPosts: any[];
  query: string;
  page?: number;
  currentTab: string;
  totalProducts: number;
  totalPosts: number;
  currentSort?: string;
  currentCategory?: string;
  currentSubcategory?: string;
}

export function SearchResultsClient({
  initialProducts,
  initialPosts,
  query,
  page = 1,
  currentTab,
  totalProducts,
  totalPosts,
  currentSort = "relevance",
  currentCategory,
  currentSubcategory,
}: SearchResultsClientProps) {
  const { convertPrice, selectedCurrency } = useCurrency();
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const hasResults = initialProducts.length > 0 || initialPosts.length > 0;

  if (!hasResults) {
    return (
      <div className="text-center py-20">
        <Search className="h-16 w-16 mx-auto text-muted/20 mb-6" />
        <h2 className="font-heading text-2xl font-medium mb-2">
          No results found
        </h2>
        <p className="text-muted font-body max-w-md mx-auto">
          We couldn&apos;t find anything for &ldquo;{query}&rdquo;. Try
          different keywords or browse our categories.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Link
            href="/fashion"
            className="text-sm text-accent hover:underline font-ui"
          >
            Browse Fashion
          </Link>
          <Link
            href="/beauty"
            className="text-sm text-accent hover:underline font-ui"
          >
            Browse Beauty
          </Link>
          <Link
            href="/electronics"
            className="text-sm text-accent hover:underline font-ui"
          >
            Browse Tech
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={currentTab}>
      <TabsList className="mb-8">
        <TabsTrigger value="products">
          Products ({totalProducts})
        </TabsTrigger>
        <TabsTrigger value="posts">
          Guides & Posts ({totalPosts})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        {initialProducts.length === 0 ? (
          <p className="text-center text-muted py-12 font-body">
            No products found for this search.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted font-body">
                {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
              </p>
              <SearchSortDropdown
                currentSort={currentSort}
                currentQuery={query}
                currentCategory={currentCategory}
                currentSubcategory={currentSubcategory}
                currentTab={currentTab}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {initialProducts.map((hit: any) => {
                const doc = hit.document;
                if (!doc) return null;
                return (
                  <Link
                    key={doc.id}
                    href={`/${doc.category_slug}/${doc.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-graphite mb-3">
                      {doc.image_urls?.[0] && (
                        <Image
                          src={doc.image_urls[0]}
                          alt={doc.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="25vw"
                        />
                      )}
                      {doc.deal_discount && (
                        <Badge variant="danger" className="absolute top-3 left-3">
                          -{doc.deal_discount}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted font-body uppercase tracking-wider mb-0.5">
                      {doc.brand || doc.category_name}
                    </p>
                    <h3 className="font-ui text-sm font-medium text-softWhite line-clamp-1 group-hover:text-accent transition-colors">
                      {doc.title}
                    </h3>
                    <p className="font-ui text-sm font-semibold text-softWhite mt-1">
                      {doc.price
                        ? formatCurrency(convertPrice(Number(doc.price)), selectedCurrency)
                        : "Price unavailable"}
                    </p>
                  </Link>
                );
              })}
            </div>
            <SearchPagination
              currentPage={page || 1}
              totalPages={totalPages}
              query={query}
              sort={currentSort}
              category={currentCategory}
              subcategory={currentSubcategory}
              tab={currentTab}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="posts">
        {initialPosts.length === 0 ? (
          <p className="text-center text-muted py-12 font-body">
            No posts or guides found for this search.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPosts.map((hit: any) => {
              const doc = hit.document;
              if (!doc) return null;
              return (
                <Link
                  key={doc.id}
                  href={`/blog/${doc.slug || doc.id}`}
                  className="group block p-6 rounded-xl border border-white/10 hover:border-white/20 transition-colors bg-graphite/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-muted" />
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {doc.type}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-lg font-medium text-softWhite group-hover:text-accent transition-colors mb-2">
                    {doc.title}
                  </h3>
                  {doc.excerpt && (
                    <p className="text-sm text-muted font-body line-clamp-2">
                      {doc.excerpt}
                    </p>
                  )}
                  {doc.author_name && (
                    <p className="text-xs text-muted mt-3 font-body">
                      By {doc.author_name}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

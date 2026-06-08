"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "zustand";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { searchStore } from "@/stores/search";
import { clientFetch } from "@/lib/api";
import type { AutocompleteResult } from "@/lib/api";

export function SearchModal() {
  const router = useRouter();
  const { isOpen, query, setQuery, closeSearch } = useStore(searchStore, (state) => state);
  const [results, setResults] = React.useState<AutocompleteResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await clientFetch<AutocompleteResult>(
          `/search?q=${encodeURIComponent(query)}&mode=autocomplete`
        );
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      closeSearch();
    }
  }

  function handleSelect(slug: string, categorySlug?: string) {
    if (categorySlug) {
      router.push(`/${categorySlug}/${slug}`);
    } else {
      router.push(`/${slug}`);
    }
    closeSearch();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-obsidian/95 backdrop-blur-2xl"
        >
          <div className="max-w-3xl mx-auto px-6 pt-20 md:pt-32">
            {/* Search form */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-transparent text-2xl md:text-3xl text-softWhite placeholder:text-muted/50 font-heading border-b border-white/10 pb-6 pl-14 pr-12 focus:outline-none"
              />
              <button
                onClick={closeSearch}
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-softWhite transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </form>

            {loading && (
              <div className="flex justify-center mt-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            )}

            {query && query.length >= 2 && results && (
              <div className="mt-8 space-y-8">
                {results.products.length > 0 && (
                  <div>
                    <h3 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
                      Products
                    </h3>
                    <div className="space-y-2">
                      {results.products.slice(0, 5).map((hit: any) => (
                        <button
                          key={hit.document?.id || hit.id}
                          onClick={() =>
                            handleSelect(
                              hit.document?.slug || hit.slug,
                              hit.document?.category_slug
                            )
                          }
                          type="button"
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-graphite shrink-0">
                            {hit.document?.image_urls?.[0] && (
                              <Image
                                src={hit.document.image_urls[0]}
                                alt={hit.document.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-softWhite font-body truncate">
                              {hit.document?.title}
                            </p>
                            <p className="text-xs text-muted font-body">
                              {hit.document?.brand || hit.document?.category_name}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results?.posts?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
                      Posts & Guides
                    </h3>
                    <div className="space-y-2">
                      {results.posts.slice(0, 3).map((hit: any) => (
                        <button
                          key={hit.document?.id || hit.id}
                          onClick={() => handleSelect(hit.document?.slug)}
                          type="button"
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-softWhite font-body truncate">
                              {hit.document?.title}
                            </p>
                            <p className="text-xs text-muted font-body capitalize">
                              {hit.document?.type}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.products.length === 0 && results.posts.length === 0 && (
                  <p className="text-center text-muted font-body mt-8">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                )}

                {query.trim().length >= 2 && (
                  <div className="text-center">
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="text-sm text-accent hover:underline font-body"
                    >
                      View all results for &ldquo;{query}&rdquo; &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {!query && (
              <div className="mt-12">
                <h3 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Wireless Headphones",
                    "Skincare Routine",
                    "Smart Home",
                    "Travel Essentials",
                    "Fitness Trackers",
                    "Coffee Makers",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      type="button"
                      className="px-4 py-2 rounded-full border border-white/10 text-sm text-muted hover:text-softWhite hover:border-white/20 transition-all font-body"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={closeSearch}
            type="button"
            className="absolute top-6 right-6 p-3 rounded-full border border-white/10 text-muted hover:text-softWhite transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

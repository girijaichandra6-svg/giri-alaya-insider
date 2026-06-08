import { Suspense } from "react";
import { SearchInput } from "./_components/search-input";
import { SearchResults } from "./_components/search-results";
import { SearchFilters } from "./_components/search-filters";
import { MobileFilterDrawer } from "./_components/mobile-filter-drawer";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  return {
    title: q ? `Search: "${q}" | ALAYA INSIDER` : "Search | ALAYA INSIDER",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    tab?: string;
    category?: string;
    subcategory?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const query = sp.q || "";
  const page = parseInt(sp.page || "1");
  const tab = sp.tab || "products";
  const category = sp.category || undefined;
  const subcategory = sp.subcategory || undefined;
  const sort = sp.sort || "relevance";

  return (
    <main className="pt-24">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumbs items={[{ label: "Search" }]} />
      </div>

      {/* Search Header */}
      <div className="max-w-3xl mx-auto px-6 mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight mb-6 text-center">
          {query ? (
            <>
              Results for <span className="text-accent">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <Suspense fallback={null}>
          <SearchInput initialQuery={query} />
        </Suspense>
      </div>

      {/* Results with Filters Sidebar */}
      {query && (
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="flex gap-8 lg:gap-12">
            {/* Filters Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28">
                <SearchFilters
                  currentCategory={category}
                  currentSubcategory={subcategory}
                  currentQuery={query}
                  currentTab={tab}
                />
              </div>
            </aside>

            {/* Mobile filter button above results */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <MobileFilterDrawer
                currentCategory={category}
                currentSubcategory={subcategory}
                currentQuery={query}
                currentTab={tab}
              />
            </div>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <Suspense
                fallback={
                  <div className="text-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
                  </div>
                }
              >
                <SearchResults
                  query={query}
                  page={page}
                  tab={tab}
                  category={category}
                  subcategory={subcategory}
                  sort={sort}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {!query && (
        <div className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <p className="text-muted font-body">
            Enter a search term above to find products, guides, and more.
          </p>
        </div>
      )}
    </main>
  );
}

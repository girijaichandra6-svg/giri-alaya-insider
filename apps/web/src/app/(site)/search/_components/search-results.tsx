import { serverFetch } from "@/lib/server-api";
import type { SearchResults as SearchResultsType } from "@/lib/api";
import { SearchResultsClient } from "./search-results-client";

interface SearchResultsProps {
  query: string;
  page: number;
  tab: string;
  category?: string;
  subcategory?: string;
  sort?: string;
}

export async function SearchResults({
  query,
  page,
  tab,
  category,
  subcategory,
  sort = "relevance",
}: SearchResultsProps) {
  let results: SearchResultsType | null = null;

  const params = new URLSearchParams();
  params.set("q", query);
  params.set("page", String(page));
  params.set("limit", "20");
  params.set("include", tab);
  params.set("sort", sort);
  if (category) params.set("category", category);
  if (subcategory) params.set("subcategory", subcategory);

  try {
    results = await serverFetch<SearchResultsType>(
      `/search?${params.toString()}`,
      { next: { revalidate: 60, tags: ["search"] } }
    );
  } catch {
    // Fallback to empty
  }

  const products = results?.products?.hits || [];
  const posts = results?.posts?.hits || [];

  return (
    <SearchResultsClient
      initialProducts={products}
      initialPosts={posts}
      query={query}
      page={page}
      currentTab={tab}
      totalProducts={results?.products?.found || 0}
      totalPosts={results?.posts?.found || 0}
      currentSort={sort}
      currentCategory={category}
      currentSubcategory={subcategory}
    />
  );
}

export const BRAND = {
  name: "ALAYA INSIDER",
  tagline: "Curated Insight for the Affluent Shopper",
  colors: {
    obsidian: "#0A0A0A",
    onyx: "#111111",
    graphite: "#1A1A1A",
    softWhite: "#F5F5F7",
    muted: "#8E8E93",
    accent: "#D4FF00",
    coral: "#FF3366",
    cyan: "#00E5FF",
  },
} as const;

export const APP_DEFAULTS = {
  theme: "dark" as const,
  currency: "USD",
  locale: "en",
  pageSize: 24,
  searchDebounceMs: 300,
} as const;

export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  posts: "posts",
  deals: "deals",
  collections: "collections",
} as const;

export const REVALIDATION = {
  homepage: 60,
  category: 120,
  product: 300,
  blog: 300,
  search: 60,
} as const;

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  imageUrl: string;
  basePrice: number | null;
  currency: string;
  categorySlug: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  clearItems: () => void;
  removeItem: (slug: string) => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.slug !== item.slug);
          return {
            items: [{ ...item, viewedAt: Date.now() }, ...filtered].slice(
              0,
              MAX_ITEMS
            ),
          };
        }),
      clearItems: () => set({ items: [] }),
      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        })),
    }),
    {
      name: "alaya-recently-viewed",
      partialize: (state) => ({ items: state.items.slice(0, MAX_ITEMS) }),
    }
  )
);

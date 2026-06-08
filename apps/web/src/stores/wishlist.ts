"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  imageUrl: string;
  basePrice: number | null;
  currency: string;
  categorySlug: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (slug: string) => void;
  toggleItem: (item: WishlistItem) => void;
  hasItem: (slug: string) => boolean;
  clearItems: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.slug === item.slug)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        })),
      toggleItem: (item) => {
        const has = get().hasItem(item.slug);
        if (has) {
          set((state) => ({
            items: state.items.filter((i) => i.slug !== item.slug),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      hasItem: (slug) => get().items.some((i) => i.slug === slug),
      clearItems: () => set({ items: [] }),
    }),
    { name: "alaya-wishlist" }
  )
);

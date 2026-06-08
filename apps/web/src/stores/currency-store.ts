"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrencyState {
  /** Currently selected currency code (e.g. "USD", "INR") */
  selectedCurrency: string;
  /** Exchange rates keyed by currency code, relative to USD */
  rates: Record<string, number>;
  /** Whether rates are currently being fetched */
  isLoading: boolean;
  /** Timestamp of last successful rates fetch */
  lastUpdated: string | null;
  /** Set the selected currency (triggers rate fetch if not cached) */
  setCurrency: (code: string) => void;
  /** Fetch exchange rates from the API */
  fetchRates: () => Promise<void>;
  /** Convert a USD amount to the selected currency */
  convertPrice: (usdAmount: number) => number;
  /** Get the rate for a specific currency */
  getRate: (currencyCode: string) => number;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: "USD",
      rates: { USD: 1 },
      isLoading: false,
      lastUpdated: null,

      setCurrency: (code) => {
        set({ selectedCurrency: code });
        // Fetch rates if we don't have them for this session
        const { rates } = get();
        if (Object.keys(rates).length <= 1) {
          get().fetchRates();
        }
      },

      fetchRates: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/rates");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          set({
            rates: data.rates,
            lastUpdated: data.updatedAt,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error);
          set({ isLoading: false });
        }
      },

      convertPrice: (usdAmount) => {
        const { rates, selectedCurrency } = get();
        const rate = rates[selectedCurrency] ?? 1;
        return usdAmount * rate;
      },

      getRate: (currencyCode) => {
        const { rates } = get();
        return rates[currencyCode] ?? 1;
      },
    }),
    {
      name: "alaya-currency",
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        rates: state.rates,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

"use client";

import * as React from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/stores/currency-store";

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD" },
  { code: "EUR", symbol: "€", label: "EUR" },
  { code: "GBP", symbol: "£", label: "GBP" },
  { code: "INR", symbol: "₹", label: "INR" },
  { code: "JPY", symbol: "¥", label: "JPY" },
  { code: "AUD", symbol: "A$", label: "AUD" },
  { code: "CAD", symbol: "C$", label: "CAD" },
] as const;

export function CurrencySwitcher() {
  const { selectedCurrency, setCurrency, fetchRates, isLoading } = useCurrency();
  const current = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  // Fetch rates on mount
  React.useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted hover:text-softWhite transition-colors font-ui">
        {isLoading ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          current.symbol
        )}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-24">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={selectedCurrency === c.code ? "text-accent" : ""}
          >
            {c.symbol} {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

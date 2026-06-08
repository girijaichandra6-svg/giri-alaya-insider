"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  initialQuery: string;
}

export function SearchInput({ initialQuery }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands, categories..."
        className="w-full bg-onyx border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-lg text-softWhite placeholder:text-muted/50 font-body focus:outline-none focus:border-accent transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-softWhite"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}

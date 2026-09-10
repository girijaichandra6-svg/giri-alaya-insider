import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Good Finds | ALAYA INSIDER",
  description:
    "Curated finds. Better products, better choices. This pick is being refreshed — browse today's Good Finds.",
};

export default function GoodFindsPage() {
  return (
    <main className="min-h-[60vh] pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted font-body mb-4">
          Alaya Insider
        </p>
        <h1 className="font-heading text-4xl font-medium mb-4">
          Good Finds
        </h1>
        <p className="text-muted font-body mb-8">
          Curated finds. Better products, better choices. This pick is being
          refreshed — check the current listing or browse today&apos;s curated
          picks below.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Browse the latest Good Finds
        </Link>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 border-t border-white/5 pt-8">
        <p className="text-xs text-muted/50 font-body text-center">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      </div>
    </main>
  );
}

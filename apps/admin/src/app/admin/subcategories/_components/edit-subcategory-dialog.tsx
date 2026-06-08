"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface SubcategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface EditSubcategoryDialogProps {
  subcategory: SubcategoryData;
  categories: CategoryOption[];
}

export function EditSubcategoryDialog({ subcategory, categories: _categories }: EditSubcategoryDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(subcategory.name);
  const [slug, setSlug] = React.useState(subcategory.slug);
  const [description, setDescription] = React.useState(subcategory.description || "");
  const [categoryId, setCategoryId] = React.useState(subcategory.categoryId);
  const [loading, setLoading] = React.useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all"
        title="Edit subcategory"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subcategory.id,
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          categoryId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update subcategory");
      }

      addToast({ title: "Subcategory updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update subcategory",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-medium">Edit Subcategory</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-muted hover:text-softWhite transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              >
                {_categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-ui text-muted hover:text-softWhite hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

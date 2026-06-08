"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface CategoryRef {
  id: string;
  name: string;
  parentId: string | null;
}

interface CreateCategoryDialogProps {
  categories: CategoryRef[];
}

export function CreateCategoryDialog({ categories }: CreateCategoryDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [accentColor, setAccentColor] = React.useState("#D4FF00");
  const [parentId, setParentId] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [metadata, setMetadata] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [slugEdited, setSlugEdited] = React.useState(false);

  function autoSlug(val: string) {
    if (!slugEdited) {
      setSlug(
        val
          .toLowerCase()
          .replace(/['']/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all"
      >
        <Plus className="h-4 w-4" />
        New Category
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const parsedMetadata = metadata.trim() ? JSON.parse(metadata) : undefined;

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || null,
          accentColor: accentColor,
          parentId: parentId || null,
          imageUrl: imageUrl.trim() || null,
          metadata: parsedMetadata,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create category");
      }

      addToast({ title: "Category created", variant: "success" });
      setOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setAccentColor("#D4FF00");
      setParentId("");
      setImageUrl("");
      setMetadata("");
      setSlugEdited(false);
      router.refresh();
    } catch (err) {
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not create category",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-medium">Create Category</h3>
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
                Name *
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  autoSlug(e.target.value);
                }}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                placeholder="Category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-mono"
                placeholder="auto-generated from name"
              />
              <p className="text-[10px] text-muted font-body mt-1">
                Auto-generated from name. Edit manually to customize.
              </p>
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
                placeholder="Category description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-10 rounded-lg border border-white/10 bg-onyx cursor-pointer"
                  />
                  <input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                    placeholder="#D4FF00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Parent Category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                >
                  <option value="">Top-level (no parent)</option>
                  {categories
                    .filter((c) => !c.parentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Image URL
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/category-image.jpg"
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Metadata (JSON)
              </label>
              <textarea
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                rows={3}
                placeholder='{"key": "value"}'
                className="w-full rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none font-mono"
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
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

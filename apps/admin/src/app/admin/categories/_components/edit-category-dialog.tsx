"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accentColor: string;
  parentId: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
}

interface CategoryRef {
  id: string;
  name: string;
  parentId: string | null;
}

interface EditCategoryDialogProps {
  category: CategoryData;
  categories: CategoryRef[];
}

function formatMetadata(meta: Record<string, unknown> | null): string {
  if (!meta) return "";
  return JSON.stringify(meta, null, 2);
}

export function EditCategoryDialog({ category, categories: _categories }: EditCategoryDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(category.name);
  const [slug, setSlug] = React.useState(category.slug);
  const [description, setDescription] = React.useState(category.description || "");
  const [accentColor, setAccentColor] = React.useState(category.accentColor);
  const [parentId, setParentId] = React.useState(category.parentId || "");
  const [imageUrl, setImageUrl] = React.useState(category.imageUrl || "");
  const [metadata, setMetadata] = React.useState(formatMetadata(category.metadata));
  const [loading, setLoading] = React.useState(false);

  // Build available parents (exclude self and descendants from the dropdown for safety)
  const availableParents = _categories.filter((c) => c.id !== category.id);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all"
        title="Edit category"
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
      let parsedMetadata: Record<string, unknown> | null | undefined;
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch {
          addToast({ title: "Error", description: "Invalid JSON in metadata field", variant: "error" });
          setLoading(false);
          return;
        }
      } else {
        parsedMetadata = null;
      }

      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: category.id,
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          accentColor,
          parentId: parentId || null,
          imageUrl: imageUrl.trim() || null,
          metadata: parsedMetadata,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update category");
      }

      addToast({ title: "Category updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update category",
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
            <h3 className="font-heading text-lg font-medium">Edit Category</h3>
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
                  {availableParents
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

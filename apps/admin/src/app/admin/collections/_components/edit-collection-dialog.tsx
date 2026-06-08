"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, GripVertical, X } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";
import { toggleProductInList, filterProductsBySearch, type ProductOption } from "./collection-utils";

interface CollectionProductData {
  productId: string;
  order: number;
  product: { id: string; title: string };
}

interface CollectionData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  type: string;
  products: CollectionProductData[];
}

interface EditCollectionDialogProps {
  collection: CollectionData;
  products: ProductOption[];
}

export function EditCollectionDialog({ collection, products: _products }: EditCollectionDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(collection.title);
  const [slug, setSlug] = React.useState(collection.slug);
  const [description, setDescription] = React.useState(collection.description || "");
  const [imageUrl, setImageUrl] = React.useState(collection.imageUrl || "");
  const [type, setType] = React.useState(collection.type);
  const [isPublic, setIsPublic] = React.useState(collection.isPublic);
  const [selectedProducts, setSelectedProducts] = React.useState<{ productId: string; title: string }[]>(
    () =>
      collection.products
        .sort((a, b) => a.order - b.order)
        .map((p) => ({ productId: p.productId, title: p.product.title }))
  );
  const [productSearch, setProductSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = React.useState<number | null>(null);

  const selectedIds = React.useMemo(
    () => new Set(selectedProducts.map((p) => p.productId)),
    [selectedProducts]
  );

  const filteredProducts = filterProductsBySearch(_products, productSearch);

  const toggleProduct = (productId: string, title: string) => {
    setSelectedProducts((prev) => toggleProductInList(prev, productId, title));
  };

  // --- Drag-and-drop handlers ---

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndicatorIndex(index);
  }

  function handleDragLeave() {
    setDropIndicatorIndex(null);
  }

  function handleDrop(e: React.DragEvent, dropTargetIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropTargetIndex) {
      setDragIndex(null);
      setDropIndicatorIndex(null);
      return;
    }

    setSelectedProducts((prev) => {
      const items = [...prev];
      const [moved] = items.splice(dragIndex!, 1);
      if (!moved) return prev;
      items.splice(dropTargetIndex, 0, moved);
      return items;
    });

    setDragIndex(null);
    setDropIndicatorIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDropIndicatorIndex(null);
  }

  function handleClose() {
    setOpen(false);
    setTitle(collection.title);
    setSlug(collection.slug);
    setDescription(collection.description || "");
    setImageUrl(collection.imageUrl || "");
    setType(collection.type);
    setIsPublic(collection.isPublic);
    setSelectedProducts(
      collection.products
        .sort((a, b) => a.order - b.order)
        .map((p) => ({ productId: p.productId, title: p.product.title }))
    );
    setProductSearch("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all"
        title="Edit collection"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const productIds = selectedProducts.map((item, index) => ({
        productId: item.productId,
        order: index,
      }));

      const res = await fetch("/api/admin/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: collection.id,
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          type,
          isPublic,
          productIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update collection");
      }

      addToast({ title: "Collection updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update collection",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-2xl rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-medium">Edit Collection</h3>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 text-muted hover:text-softWhite transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                >
                  <option value="EDITORIAL">Editorial</option>
                  <option value="SEASONAL">Seasonal</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">Visibility</label>
                <select
                  value={isPublic ? "public" : "private"}
                  onChange={(e) => setIsPublic(e.target.value === "public")}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">Image URL</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Product Assignment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-ui font-medium text-softWhite">
                  Products ({selectedProducts.length} selected)
                </label>
              </div>

              {/* Ordered Selected Products with Drag-and-Drop */}
              {selectedProducts.length > 0 && (
                <div className="mb-2 rounded-lg border border-white/10 divide-y divide-white/5 bg-onyx/50">
                  {selectedProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 px-3 py-2 group transition-colors ${
                        dragIndex === index
                          ? "opacity-40 bg-white/5"
                          : dropIndicatorIndex === index
                            ? "border-t border-accent"
                            : ""
                      }`}
                    >
                      <span className="cursor-grab active:cursor-grabbing text-muted hover:text-softWhite transition-colors">
                        <GripVertical className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[11px] font-mono text-muted w-5 text-right shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs text-softWhite font-body truncate flex-1">
                        {product.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleProduct(product.productId, product.title)}
                        className="p-0.5 rounded text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products to assign..."
                className="w-full h-9 rounded-lg border border-white/10 bg-onyx px-3 text-xs text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors mb-2"
              />
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
                {filteredProducts.length === 0 ? (
                  <p className="p-4 text-xs text-muted text-center font-body">No products found.</p>
                ) : (
                  filteredProducts.slice(0, 50).map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleProduct(product.id, product.title)}
                        className="h-4 w-4 rounded border-white/20 bg-onyx text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs text-softWhite font-body truncate">
                        {product.title}
                      </span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-[10px] text-muted font-body mt-1">
                Drag the <GripVertical className="h-2.5 w-2.5 inline -mt-0.5" /> handle to reorder selected products. Check/uncheck products below to add or remove.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-ui text-muted hover:text-softWhite hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
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

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface ProductOption {
  id: string;
  title: string;
}

interface RetailerOption {
  id: string;
  name: string;
}

interface CreateCouponDialogProps {
  products: ProductOption[];
  retailers: RetailerOption[];
}

export function CreateCouponDialog({ products, retailers }: CreateCouponDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [discount, setDiscount] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [productId, setProductId] = React.useState("");
  const [retailerId, setRetailerId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all"
      >
        <Plus className="h-4 w-4" />
        New Coupon
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          description: description.trim(),
          discount: discount.trim() || null,
          expiresAt: expiresAt || null,
          productId: productId || null,
          retailerId: retailerId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create coupon");

      addToast({ title: "Coupon created", variant: "success" });
      setOpen(false);
      setCode("");
      setDescription("");
      setDiscount("");
      setExpiresAt("");
      setProductId("");
      setRetailerId("");
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not create coupon", variant: "error" });
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
            <h3 className="font-heading text-lg font-medium">Create Coupon</h3>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Code *
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-mono uppercase"
                  placeholder="SAVE20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Discount
                </label>
                <input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="e.g. 20% OFF"
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
                placeholder="Coupon description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Expires At
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Product (optional)
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                >
                  <option value="">Any product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Retailer (optional)
                </label>
                <select
                  value={retailerId}
                  onChange={(e) => setRetailerId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                >
                  <option value="">Any retailer...</option>
                  {retailers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
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
              disabled={loading || !code.trim() || !description.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

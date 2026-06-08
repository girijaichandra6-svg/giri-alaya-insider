"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface DealData {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  product: { id: string; title: string } | null;
}

interface ProductOption {
  id: string;
  title: string;
}

interface EditDealDialogProps {
  deal: DealData;
  products: ProductOption[];
}

function toDateInputValue(date: string | Date): string {
  const d = new Date(date);
  const parts = d.toISOString().split("T");
  return parts[0] ?? "";
}

export function EditDealDialog({ deal, products: _products }: EditDealDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(deal.title);
  const [description, setDescription] = React.useState(deal.description || "");
  const [code, setCode] = React.useState(deal.code || "");
  const [discount, setDiscount] = React.useState(deal.discount?.toString() ?? "");
  const [startDate, setStartDate] = React.useState(toDateInputValue(deal.startDate));
  const [endDate, setEndDate] = React.useState(toDateInputValue(deal.endDate));
  const [isActive, setIsActive] = React.useState(deal.isActive);
  const [loading, setLoading] = React.useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all"
        title="Edit deal"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deal.id,
          title,
          description: description.trim() || null,
          code: code.trim() || null,
          discount: discount ? Number(discount) : null,
          startDate,
          endDate,
          isActive,
        }),
      });

      if (!res.ok) throw new Error("Failed to update deal");

      addToast({ title: "Deal updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not update deal", variant: "error" });
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
            <h3 className="font-heading text-lg font-medium">Edit Deal</h3>
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
                Product
              </label>
              <select
                value={deal.product?.id || ""}
                disabled
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx/50 px-3 text-sm text-muted focus:outline-none transition-colors cursor-not-allowed"
              >
                <option value={deal.product?.id || ""}>
                  {deal.product?.title || "Unknown product"}
                </option>
              </select>
              <p className="text-[10px] text-muted font-body mt-1">Product cannot be changed after creation.</p>
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                required
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
                  Code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-mono"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Discount %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="20"
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-ui font-medium text-softWhite mb-1.5">
                Status
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="w-full h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              disabled={loading || !title.trim() || !startDate || !endDate}
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

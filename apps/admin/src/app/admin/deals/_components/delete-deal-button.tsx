"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface DeleteDealButtonProps {
  dealId: string;
  dealTitle: string;
}

export function DeleteDealButton({
  dealId,
  dealTitle,
}: DeleteDealButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/deals?id=${dealId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete deal");

      addToast({ title: "Deal deleted", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not delete deal", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted hover:text-coral hover:bg-coral/10 transition-all"
        title="Delete deal"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl">
        <h3 className="font-heading text-lg font-medium mb-2">Delete Deal</h3>
        <p className="text-sm text-muted font-body mb-6">
          Are you sure you want to delete <strong className="text-softWhite">&ldquo;{dealTitle}&rdquo;</strong>?
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-ui text-muted hover:text-softWhite hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-coral text-white text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

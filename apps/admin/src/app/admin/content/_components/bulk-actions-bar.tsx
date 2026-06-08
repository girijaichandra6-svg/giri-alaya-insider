"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Archive, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  selectedIds,
  onClearSelection,
}: BulkActionsBarProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState<"delete" | "archive" | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<"delete" | "archive" | null>(null);

  async function handleBulkAction(action: "delete" | "archive") {
    setLoading(action);
    try {
      const ids = selectedIds;

      if (ids.length === 0) {
        addToast({ title: "Error", description: "No posts selected", variant: "error" });
        return;
      }

      const res = await fetch("/api/admin/content/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });

      if (!res.ok) throw new Error(`Failed to ${action} posts`);

      const label = action === "delete" ? "deleted" : "archived";
      addToast({
        title: `${ids.length} post${ids.length === 1 ? "" : "s"} ${label}`,
        variant: "success",
      });
      setConfirmAction(null);
      onClearSelection();
      router.refresh();
    } catch {
      addToast({
        title: "Error",
        description: `Could not ${action} posts`,
        variant: "error",
      });
    } finally {
      setLoading(null);
    }
  }

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 mb-4">
        <span className="text-sm font-ui font-medium text-accent">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setConfirmAction("archive")}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-ui font-semibold hover:bg-amber-500/20 transition-all disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive All
          </button>
          <button
            onClick={() => setConfirmAction("delete")}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-coral/10 text-coral text-xs font-ui font-semibold hover:bg-coral/20 transition-all disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete All
          </button>
          <button
            onClick={onClearSelection}
            disabled={loading !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-ui text-muted hover:text-softWhite hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmAction(null)}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl">
            <h3 className="font-heading text-lg font-medium mb-2">
              {confirmAction === "delete" ? "Delete Posts" : "Archive Posts"}
            </h3>
            <p className="text-sm text-muted font-body mb-6">
              {confirmAction === "delete" ? (
                <>
                  Are you sure you want to delete <strong className="text-softWhite">{selectedCount}</strong>{" "}
                  post{selectedCount === 1 ? "" : "s"}? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to archive <strong className="text-softWhite">{selectedCount}</strong>{" "}
                  post{selectedCount === 1 ? "" : "s"}? Archived posts will be hidden from the site.
                </>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={loading !== null}
                className="px-4 py-2 rounded-lg text-sm font-ui text-muted hover:text-softWhite hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction(confirmAction)}
                disabled={loading !== null}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-ui font-semibold transition-all disabled:opacity-50 ${
                  confirmAction === "delete"
                    ? "bg-coral text-white"
                    : "bg-amber-500 text-obsidian"
                }`}
              >
                {loading === confirmAction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {confirmAction === "delete" ? "Deleting..." : "Archiving..."}
                  </>
                ) : confirmAction === "delete" ? (
                  "Delete"
                ) : (
                  "Archive"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

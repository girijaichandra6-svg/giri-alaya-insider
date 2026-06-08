"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@alaya/ui";

interface EditReviewDialogProps {
  reviewId: string;
  initialRating: number;
  initialTitle: string | null;
  initialBody: string;
}

export function EditReviewDialog({ reviewId, initialRating, initialTitle, initialBody }: EditReviewDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(initialRating);
  const [title, setTitle] = React.useState(initialTitle ?? "");
  const [body, setBody] = React.useState(initialBody);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || rating < 1) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reviewId,
          rating,
          title: title.trim() || null,
          body: body.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update review");

      addToast({ title: "Review updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not update review", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete review");

      addToast({ title: "Review deleted", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not delete review", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all">
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review rating and content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        i < rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-white/20"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title (optional)</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your review"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="edit-body">Review</Label>
              <textarea
                id="edit-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none font-body"
                placeholder="Share your experience with this product..."
                required
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
              size="sm"
            >
              Delete Review
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !body.trim() || rating < 1}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

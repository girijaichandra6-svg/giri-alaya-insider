"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface EditWishlistDialogProps {
  wishlistId: string;
  initialName: string;
  initialIsPublic: boolean;
}

export function EditWishlistDialog({
  wishlistId,
  initialName,
  initialIsPublic,
}: EditWishlistDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(initialName);
  const [isPublic, setIsPublic] = React.useState(initialIsPublic);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/wishlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: wishlistId,
          name: name.trim(),
          isPublic,
        }),
      });

      if (!res.ok) throw new Error("Failed to update wishlist");

      addToast({ title: "Wishlist updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({
        title: "Error",
        description: "Could not update wishlist",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Settings className="h-4 w-4 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Wishlist</DialogTitle>
            <DialogDescription>
              Update the name and visibility of your wishlist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wishlist name"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public" className="cursor-pointer">
                  Public wishlist
                </Label>
                <p className="text-xs text-muted font-body">
                  Anyone with the link can view this wishlist
                </p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

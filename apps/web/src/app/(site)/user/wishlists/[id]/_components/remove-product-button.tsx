"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface RemoveProductButtonProps {
  wishlistId: string;
  productId: string;
  productTitle: string;
}

export function RemoveProductButton({
  wishlistId,
  productId,
  productTitle,
}: RemoveProductButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: wishlistId,
          productId,
          action: "remove",
        }),
      });

      if (!res.ok) throw new Error("Failed to remove product");

      addToast({
        title: "Product removed",
        description: `Removed "${productTitle}" from wishlist`,
        variant: "success",
      });
      router.refresh();
    } catch {
      addToast({
        title: "Error",
        description: "Could not remove product",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="p-2 rounded-lg text-muted hover:text-coral hover:bg-coral/10 transition-all disabled:opacity-50 shrink-0"
      title={`Remove ${productTitle} from wishlist`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <X className="h-4 w-4" />
      )}
    </button>
  );
}

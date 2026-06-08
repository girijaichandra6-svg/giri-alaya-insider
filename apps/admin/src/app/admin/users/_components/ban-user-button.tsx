"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface BanUserButtonProps {
  userId: string;
  userName: string;
  isBanned: boolean;
}

export function BanUserButton({
  userId,
  userName,
  isBanned,
}: BanUserButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`p-2 rounded-lg transition-all ${
          isBanned
            ? "text-emerald-400 hover:bg-emerald-500/10"
            : "text-muted hover:text-coral hover:bg-coral/10"
        }`}
        title={isBanned ? "Unban user" : "Ban user"}
      >
        {isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
      </button>
    );
  }

  async function handleAction() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, banned: !isBanned }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      addToast({
        title: isBanned ? "User unbanned" : "User banned",
        variant: "success",
      });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({
        title: "Error",
        description: "Could not update user",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl">
        <h3 className="font-heading text-lg font-medium mb-2">
          {isBanned ? "Unban User" : "Ban User"}
        </h3>
        <p className="text-sm text-muted font-body mb-6">
          {isBanned ? (
            <>
              Are you sure you want to unban <strong className="text-softWhite">{userName}</strong>?
              They will regain access to their account.
            </>
          ) : (
            <>
              Are you sure you want to ban <strong className="text-softWhite">{userName}</strong>?
              They will lose access to their account until unbanned.
            </>
          )}
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
            onClick={handleAction}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-ui font-semibold transition-all disabled:opacity-50 ${
              isBanned
                ? "bg-emerald-500 text-obsidian"
                : "bg-coral text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isBanned ? "Unbanning..." : "Banning..."}
              </>
            ) : isBanned ? (
              "Unban"
            ) : (
              "Ban"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

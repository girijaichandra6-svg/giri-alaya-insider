"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface EditUserRoleDialogProps {
  userId: string;
  userName: string;
  currentRole: string;
}

const ROLE_OPTIONS = [
  { value: "USER", label: "User", color: "text-muted" },
  { value: "EDITOR", label: "Editor", color: "text-cyan-400" },
  { value: "ADMIN", label: "Admin", color: "text-amber-400" },
  { value: "SUPER_ADMIN", label: "Super Admin", color: "text-coral" },
] as const;

export function EditUserRoleDialog({
  userId,
  userName,
  currentRole,
}: EditUserRoleDialogProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState(currentRole);
  const [loading, setLoading] = React.useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all"
        title="Change role"
      >
        <Shield className="h-4 w-4" />
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === currentRole) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      addToast({ title: "Role updated", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not update role", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-white/10 bg-obsidian p-6 shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-medium">Change Role</h3>
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

          <p className="text-sm text-muted font-body mb-4">
            Changing role for <strong className="text-softWhite">{userName}</strong>
          </p>

          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  role === opt.value
                    ? "border-accent/30 bg-accent/5"
                    : "border-white/5 bg-onyx hover:border-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-accent focus:ring-accent border-white/20"
                />
                <span className={`text-sm font-ui font-medium ${opt.color}`}>
                  {opt.label}
                </span>
              </label>
            ))}
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
              disabled={loading || role === currentRole}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

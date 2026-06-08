"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@alaya/ui";

// Simple toast implementation without external dependency

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

let toastId = 0;
function generateId() {
  return `toast-${++toastId}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl animate-in slide-in-from-right-full",
              {
                "border-white/10 bg-graphite/90": toast.variant === "default" || !toast.variant,
                "border-emerald-500/20 bg-emerald-500/10": toast.variant === "success",
                "border-coral/20 bg-coral/10": toast.variant === "error",
                "border-cyan/20 bg-cyan/10": toast.variant === "info",
              }
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-softWhite font-ui">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-muted mt-0.5 font-body">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-muted hover:text-softWhite transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

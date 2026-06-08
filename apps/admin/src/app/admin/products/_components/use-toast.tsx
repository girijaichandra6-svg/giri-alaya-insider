"use client";

import * as React from "react";

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
    // Fallback for when no provider exists
    return {
      toasts: [],
      addToast: (toast: Omit<Toast, "id">) => {
        console.log(`[Toast] ${toast.title}${toast.description ? `: ${toast.description}` : ""}`);
      },
      removeToast: () => {},
    };
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
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const bgMap = {
            default: "bg-graphite/90 border-white/10",
            success: "bg-emerald-500/10 border-emerald-500/20",
            error: "bg-coral/10 border-coral/20",
            info: "bg-cyan/10 border-cyan/20",
          };
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl animate-in slide-in-from-right-full ${
                bgMap[toast.variant || "default"]
              }`}
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
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Trash2, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@alaya/utils";

interface AlertData {
  id: string;
  targetPrice: number;
  currency: string;
  isActive: boolean;
  product: {
    id: string;
    slug: string;
    title: string;
    basePrice: number | null;
    currency: string;
    imageUrls: string[];
    category: { slug: string };
  };
}

interface AlertsListProps {
  alerts: AlertData[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  async function handleToggle(alertId: string, currentActive: boolean) {
    setToggling(alertId);
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alertId, isActive: !currentActive }),
      });

      if (!res.ok) throw new Error("Failed to update alert");

      addToast({
        title: currentActive ? "Alert paused" : "Alert activated",
        variant: "success",
      });
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not update alert", variant: "error" });
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(alertId: string) {
    setDeleting(alertId);
    try {
      const res = await fetch(`/api/alerts?id=${alertId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete alert");

      addToast({ title: "Alert deleted", variant: "success" });
      router.refresh();
    } catch {
      addToast({ title: "Error", description: "Could not delete alert", variant: "error" });
    } finally {
      setDeleting(null);
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="p-12 rounded-xl border border-white/10 bg-graphite/30 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted/30 mb-4" />
        <p className="text-muted font-body mb-2">
          No price alerts set yet.
        </p>
        <p className="text-sm text-muted/60 font-body">
          Browse products and set price alerts to get notified when prices drop.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const currentPrice = alert.product.basePrice
          ? Number(alert.product.basePrice)
          : null;
        const isTriggered = currentPrice !== null && currentPrice <= Number(alert.targetPrice);

        return (
          <div
            key={alert.id}
            className={`rounded-xl border p-5 transition-all ${
              alert.isActive
                ? "border-white/10 bg-graphite/30"
                : "border-white/5 bg-graphite/20 opacity-60"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Product thumbnail */}
              <div
                className="w-12 h-12 rounded-lg bg-onyx flex items-center justify-center shrink-0 cursor-pointer"
                onClick={() => router.push(`/${alert.product.category.slug}/${alert.product.slug}`)}
              >
                <Package className="h-5 w-5 text-muted" />
              </div>

              {/* Alert info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <button
                      onClick={() => router.push(`/${alert.product.category.slug}/${alert.product.slug}`)}
                      className="font-ui text-sm font-medium text-softWhite hover:text-accent transition-colors text-left truncate max-w-[250px] block"
                    >
                      {alert.product.title}
                    </button>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted font-body">
                        Target: {formatCurrency(Number(alert.targetPrice), alert.currency)}
                      </span>
                      {currentPrice !== null && (
                        <span className="text-xs text-muted font-body">
                          Current: {formatCurrency(currentPrice, alert.currency)}
                        </span>
                      )}
                    </div>
                    {isTriggered && alert.isActive && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-accent font-ui">
                        Price target reached!
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-body hidden sm:inline">
                        {alert.isActive ? "Active" : "Paused"}
                      </span>
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => handleToggle(alert.id, alert.isActive)}
                        disabled={toggling === alert.id}
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      disabled={deleting === alert.id}
                      className="p-2 rounded-lg text-muted hover:text-coral hover:bg-coral/10 transition-all disabled:opacity-50"
                    >
                      {deleting === alert.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

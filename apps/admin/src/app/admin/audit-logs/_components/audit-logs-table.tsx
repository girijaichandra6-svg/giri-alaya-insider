"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  EyeOff,
} from "lucide-react";

interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

interface AuditLogsTableProps {
  initialAction: string;
  initialEntity: string;
  initialFrom: string;
  initialTo: string;
  initialPage: number;
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getEntityColor(entity: string): string {
  const colors: Record<string, string> = {
    product: "bg-blue-500/10 text-blue-400",
    post: "bg-emerald-500/10 text-emerald-400",
    user: "bg-purple-500/10 text-purple-400",
    sitemap: "bg-amber-500/10 text-amber-400",
    robots: "bg-orange-500/10 text-orange-400",
  };
  return colors[entity] || "bg-white/5 text-muted";
}

export function AuditLogsTable({
  initialAction,
  initialEntity,
  initialFrom,
  initialTo,
  initialPage,
}: AuditLogsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<AuditLogRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [page, setPage] = React.useState(initialPage);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Filter inputs (controlled from URL params)
  const [actionInput, setActionInput] = React.useState(initialAction);
  const [entityInput, setEntityInput] = React.useState(initialEntity);
  const [fromInput, setFromInput] = React.useState(initialFrom);
  const [toInput, setToInput] = React.useState(initialTo);

  const fetchLogs = React.useCallback(
    async (action: string, entity: string, from: string, to: string, pageNum: number) => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        if (action) sp.set("action", action);
        if (entity) sp.set("entity", entity);
        if (from) sp.set("from", from);
        if (to) sp.set("to", to);
        if (pageNum > 1) sp.set("page", String(pageNum));

        const res = await fetch(`/api/admin/audit-logs?${sp.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Re-fetch whenever search params change (e.g., pagination, filter submission)
  React.useEffect(() => {
    const action = searchParams.get("action") || "";
    const entity = searchParams.get("entity") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const pageNum = parseInt(searchParams.get("page") || "1");

    // Sync inputs with URL
    setActionInput(action);
    setEntityInput(entity);
    setFromInput(from);
    setToInput(to);

    fetchLogs(action, entity, from, to, pageNum);
  }, [searchParams, fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (actionInput) sp.set("action", actionInput);
    if (entityInput) sp.set("entity", entityInput);
    if (fromInput) sp.set("from", fromInput);
    if (toInput) sp.set("to", toInput);
    router.push(`${pathname}?${sp.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setExpandedId(null);
    const sp = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      sp.set("page", String(newPage));
    } else {
      sp.delete("page");
    }
    router.push(`${pathname}?${sp.toString()}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-white/10 bg-obsidian p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted" />
          <h2 className="font-heading text-sm font-medium">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1.5">
              Action
            </label>
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder="e.g. product.create, user.ban"
              className="w-full h-9 px-3 rounded-lg border border-white/10 bg-onyx text-xs text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-body"
            />
          </div>
          <div>
            <label className="block text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1.5">
              Entity
            </label>
            <input
              type="text"
              value={entityInput}
              onChange={(e) => setEntityInput(e.target.value)}
              placeholder="e.g. product, post, user"
              className="w-full h-9 px-3 rounded-lg border border-white/10 bg-onyx text-xs text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-body"
            />
          </div>
          <div>
            <label className="block text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1.5">
              <Calendar className="h-3 w-3 inline mr-1" />
              From
            </label>
            <input
              type="date"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-white/10 bg-onyx text-xs text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-body"
            />
          </div>
          <div>
            <label className="block text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1.5">
              <Calendar className="h-3 w-3 inline mr-1" />
              To
            </label>
            <input
              type="date"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-white/10 bg-onyx text-xs text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-body"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-obsidian text-xs font-ui font-semibold hover:brightness-110 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            Search Logs
          </button>
          {total > 0 && (
            <span className="text-xs text-muted font-body">
              {total} log{total === 1 ? "" : "s"} found
            </span>
          )}
        </div>
      </form>

      {/* Results */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted font-body">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <EyeOff className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted font-body">No audit logs match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="hover:bg-white/[0.02] transition-colors">
                {/* Main row */}
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-ui font-semibold shrink-0 ${getEntityColor(
                        log.entity
                      )}`}
                    >
                      {log.entity}
                    </span>
                    <span className="text-xs font-ui text-softWhite font-medium">
                      {formatAction(log.action)}
                    </span>
                    {log.entityId && (
                      <span className="text-[10px] text-muted font-mono truncate hidden sm:inline">
                        #{log.entityId.slice(0, 12)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-muted font-body hidden md:inline">
                      {log.user?.name || log.user?.email || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted font-body">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {expandedId === log.id ? (
                      <ChevronUp className="h-3.5 w-3.5 text-muted shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedId === log.id && (
                  <div className="px-4 pb-4 pt-0 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-onyx p-3">
                        <p className="text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1">
                          Admin
                        </p>
                        <p className="text-xs text-softWhite font-body">
                          {log.user?.name || log.user?.email || "Unknown"}
                        </p>
                        {log.user?.name && (
                          <p className="text-[10px] text-muted font-body">{log.user.email}</p>
                        )}
                      </div>
                      <div className="rounded-lg bg-onyx p-3">
                        <p className="text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1">
                          Timestamp
                        </p>
                        <p className="text-xs text-softWhite font-body">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg bg-onyx p-3">
                        <p className="text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-1">
                          Request Info
                        </p>
                        <p className="text-xs text-softWhite font-body font-mono">
                          {log.ip || "No IP"}
                        </p>
                        {log.userAgent && (
                          <p className="text-[10px] text-muted font-body truncate" title={log.userAgent}>
                            {log.userAgent}
                          </p>
                        )}
                      </div>
                    </div>
                    {log.changes && (
                      <div className="rounded-lg bg-onyx p-3">
                        <p className="text-[10px] font-ui font-semibold text-muted uppercase tracking-wider mb-2">
                          Changes
                        </p>
                        <pre className="text-xs text-softWhite font-mono whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted font-body">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-ui transition-colors ${
                    p === page
                      ? "bg-accent text-obsidian"
                      : "text-muted hover:text-softWhite hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui disabled:opacity-30 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Eye } from "lucide-react";
import { EditUserRoleDialog } from "./edit-user-role-dialog";
import { BanUserButton } from "./ban-user-button";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  deletedAt: Date | null;
  createdAt: Date;
  _count: {
    reviews: number;
    posts: number;
    comments: number;
  };
}

interface UsersTableProps {
  users: UserRow[];
  query: string;
  roleFilter: string;
  page: number;
  totalPages: number;
}

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-white/5 text-muted",
  EDITOR: "bg-cyan-500/10 text-cyan-400",
  ADMIN: "bg-amber-500/10 text-amber-400",
  SUPER_ADMIN: "bg-coral/10 text-coral",
};

const ROLE_FILTERS = ["all", "USER", "EDITOR", "ADMIN", "SUPER_ADMIN"] as const;

function buildUrl(
  params: Record<string, string | undefined>,
  currentQuery: string,
  currentRole: string
) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (params.role || currentRole !== "all")
    sp.set("role", params.role || currentRole);
  if (params.page) sp.set("page", params.page);
  const qs = sp.toString();
  return `/admin/users${qs ? `?${qs}` : ""}`;
}

export function UsersTable({
  users,
  query,
  roleFilter,
  page,
  totalPages,
}: UsersTableProps) {
  const router = useRouter();

  return (
    <>
      {/* Search & Role Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const q = formData.get("q") as string;
            const url = new URL(window.location.href);
            if (q) {
              url.searchParams.set("q", q);
            } else {
              url.searchParams.delete("q");
            }
            url.searchParams.delete("page");
            router.push(url.pathname + url.search);
          }}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search users by name or email..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          {ROLE_FILTERS.map((r) => {
            const href = buildUrl({ role: r === "all" ? undefined : r, page: "1" }, query, roleFilter);
            return (
              <a
                key={r}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui transition-colors ${
                  roleFilter === r
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-softWhite hover:bg-white/5"
                }`}
              >
                {r === "all" ? "All" : r.charAt(0) + r.slice(1).toLowerCase().replace("_", " ")}
              </a>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Joined
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Activity
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No users matching "${query}"`
                      : "No users yet."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-white/5 transition-colors ${
                      user.deletedAt ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-onyx flex items-center justify-center shrink-0 overflow-hidden">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-muted font-ui">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-softWhite font-body truncate max-w-[180px]">
                            {user.name || "Unnamed"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted font-body truncate max-w-[200px] block">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold ${
                          ROLE_STYLES[user.role] || ROLE_STYLES.USER
                        }`}
                      >
                        {user.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.deletedAt ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold bg-coral/10 text-coral">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold bg-emerald-500/10 text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted font-body">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted font-body">
                        {user._count.reviews + user._count.posts + user._count.comments} interactions
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/admin/users/${user.id}`}
                          className="p-2 rounded-lg text-muted hover:text-softWhite hover:bg-white/5 transition-all"
                          title="View user details"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <EditUserRoleDialog
                          userId={user.id}
                          userName={user.name || user.email}
                          currentRole={user.role}
                        />
                        <BanUserButton
                          userId={user.id}
                          userName={user.name || user.email}
                          isBanned={!!user.deletedAt}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted font-body">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={buildUrl({ page: String(page - 1) }, query, roleFilter)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </a>
            )}
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
                <a
                  key={p}
                  href={buildUrl({ page: String(p) }, query, roleFilter)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-ui transition-colors ${
                    p === page
                      ? "bg-accent text-obsidian"
                      : "text-muted hover:text-softWhite hover:bg-white/5"
                  }`}
                >
                  {p}
                </a>
              );
            })}
            {page < totalPages && (
              <a
                href={buildUrl({ page: String(page + 1) }, query, roleFilter)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

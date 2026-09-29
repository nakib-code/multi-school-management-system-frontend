"use client";

import { AlertCircle, ArrowLeft, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  USER_CATEGORIES,
  type UserCategoryKey,
} from "@/features/super-admin/users/constants";
import {
  useSchoolUsers,
  useSchoolUserSummary,
} from "@/features/super-admin/users/hooks";

const PAGE_SIZE = 10;

interface RoleUserListProps {
  schoolId: number;
  role: UserCategoryKey;
  onBack: () => void;
}

export function RoleUserList({ schoolId, role, onBack }: RoleUserListProps) {
  const category = USER_CATEGORIES.find((item) => item.key === role)!;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search so we don't call the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: summary } = useSchoolUserSummary(schoolId);

  const { data, isLoading, isError, isFetching, refetch } = useSchoolUsers(
    schoolId,
    {
      role: category.role,
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
    },
  );

  const users = data?.users ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
          aria-label="Back to school"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <p className="text-sm text-muted-foreground">
            {summary?.school.name ?? "School"}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {category.label}s
            {summary ? ` (${summary.counts[role]})` : ""}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={`Search ${category.label.toLowerCase()}s...`}
          className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load users.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            No {category.label.toLowerCase()}s found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last login</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{user.name}</td>
                    <td className="px-5 py-3">{user.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          user.status === "ACTIVE"
                            ? "rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600"
                            : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
            <span className="text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {meta.total} users
              {isFetching ? " · updating..." : ""}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
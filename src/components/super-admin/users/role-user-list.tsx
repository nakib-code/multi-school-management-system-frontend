"use client";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  USER_CATEGORIES,
  type UserCategoryKey,
} from "@/features/super-admin/users/constants";

import {
  useSchoolUsers,
  useSchoolUserSummary,
} from "@/features/super-admin/users/hooks";

import type { SchoolUserStatus } from "@/features/super-admin/users/types";

const PAGE_SIZE = 10;

interface RoleUserListProps {
  schoolId: number;
  role: UserCategoryKey;
  onBack: () => void;
}

export function RoleUserList({
  schoolId,
  role,
  onBack,
}: RoleUserListProps) {
  const category = USER_CATEGORIES.find(
    (item) => item.key === role,
  );

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    SchoolUserStatus | ""
  >("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: summary } = useSchoolUserSummary(schoolId);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useSchoolUsers(schoolId, {
    role: category?.role,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
  });

  const users = data?.users ?? [];
  const meta = data?.meta;

  if (!category) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">
          Invalid user category.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Back
        </button>
      </div>
    );
  }

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
            {summary
              ? ` (${summary.counts[role]})`
              : ""}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder={`Search ${category.label.toLowerCase()}s...`}
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value as SchoolUserStatus | "",
            );
            setPage(1);
          }}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {isLoading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading users...
            </div>
          </div>
        ) : isError ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center gap-3">
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
          <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
            <p className="font-medium">
              No {category.label.toLowerCase()}s found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Name
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Email
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Phone
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Last Login
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3 font-medium">
                      {user.name}
                    </td>

                    <td className="px-5 py-3">
                      {user.email}
                    </td>

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
                        ? new Date(
                            user.lastLoginAt,
                          ).toLocaleDateString("en-BD")
                        : "Never"}
                    </td>

                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(
                        user.createdAt,
                      ).toLocaleDateString("en-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Page {meta.page} of {meta.totalPages} ·{" "}
              {meta.total} users
              {isFetching ? " · updating..." : ""}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="rounded-md border px-3 py-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= meta.totalPages || isFetching
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-md border px-3 py-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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

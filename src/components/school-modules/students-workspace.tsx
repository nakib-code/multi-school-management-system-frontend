"use client";

import { GraduationCap, Search, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useActivateStudent,
  useDeactivateStudent,
  useStudents,
} from "@/features/students/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function StudentsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const isAdmin = user?.role === "ADMIN";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useStudents(schoolId, {
    page,
    limit: 15,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const deactivateMutation = useDeactivateStudent(schoolId);
  const activateMutation = useActivateStudent(schoolId);

  if (isLoading) return <LoadingState message="Loading students..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load students")}
        onRetry={() => refetch()}
      />
    );
  }

  const students = data?.students ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Active students enrolled in your institution ({pagination?.total ?? students.length} total).
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, ID, email..."
            className="pl-9"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Approved admissions automatically create student accounts here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {s.studentId}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {s.firstName} {s.lastName ?? ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.phone ?? s.user?.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        s.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {s.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {s.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deactivateMutation.mutate(s.id)}
                          disabled={deactivateMutation.isPending}
                          className="gap-1.5 text-destructive hover:text-destructive"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activateMutation.mutate(s.id)}
                          disabled={activateMutation.isPending}
                          className="gap-1.5"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Activate
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

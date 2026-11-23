"use client";

import { Eye, ScrollText, Search } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type PlatformAuditLogItem,
  usePlatformAuditLogs,
} from "@/features/super-admin/platform-audit-logs/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";

export default function SuperAdminPlatformAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [selected, setSelected] = useState<PlatformAuditLogItem | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = usePlatformAuditLogs({
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(action ? { action } : {}),
  });

  if (isLoading) return <LoadingState message="Loading platform audit logs..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load platform audit logs")}
        onRetry={() => refetch()}
      />
    );
  }

  const logs = data?.logs ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Platform Audit Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable platform-wide security, institution, subscription, and payment audit trail.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search actor, entity, school, description..."
            className="pl-9"
          />
        </div>

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="APPROVE">APPROVE</option>
          <option value="REJECT">REJECT</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No platform audit logs found"
          description="Platform-wide administrative and security events will be recorded here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{log.actor?.name ?? "System"}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.actor?.email ?? ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {log.entityType} {log.entityId ? `#${log.entityId}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {log.school?.name ?? "Platform"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(log)}
                      className="gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} events)
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Platform Audit Event Details"
        maxWidthClass="max-w-lg"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Description</p>
              <p className="mt-0.5 font-medium">{selected.description ?? "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="uppercase text-muted-foreground">Action</p>
                <p className="mt-0.5 font-medium">{selected.action}</p>
              </div>
              <div>
                <p className="uppercase text-muted-foreground">Entity</p>
                <p className="mt-0.5 font-medium">
                  {selected.entityType} {selected.entityId ? `#${selected.entityId}` : ""}
                </p>
              </div>
              <div>
                <p className="uppercase text-muted-foreground">IP Address</p>
                <p className="mt-0.5 font-mono">{selected.ipAddress ?? "—"}</p>
              </div>
              <div>
                <p className="uppercase text-muted-foreground">Timestamp</p>
                <p className="mt-0.5">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {selected.metadata && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Safe Metadata</p>
                <pre className="mt-1 overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs">
                  {JSON.stringify(selected.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

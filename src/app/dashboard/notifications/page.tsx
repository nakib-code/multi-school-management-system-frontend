"use client";

import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";
import { getApiErrorMessage } from "@/lib/api";

export default function NotificationsHistoryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading, isError, error, refetch } = useNotifications({
    page,
    limit: 15,
    ...(filter === "unread" ? { isRead: false } : {}),
  });

  const markReadMut = useMarkNotificationRead();
  const markAllMut = useMarkAllNotificationsRead();
  const deleteMut = useDeleteNotification();

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live updates across admissions, academics, fees, and subscriptions ({unreadCount} unread).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as "all" | "unread");
                setPage(1);
              }}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread Only</option>
            </select>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllMut.mutate()}
                disabled={markAllMut.isPending}
                className="gap-1.5"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading notifications..." />
        ) : isError ? (
          <ErrorState
            message={getApiErrorMessage(error, "Failed to load notifications")}
            onRetry={() => refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You have no notifications matching this filter."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                  n.isRead ? "bg-card" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {n.type}
                    </span>
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReadMut.mutate(n.id)}
                      className="gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMut.mutate(n.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
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
      </div>
    </DashboardShell>
  );
}

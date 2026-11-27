"use client";

import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";

export default function SuperAdminNotificationSettingsPage() {
  const { data, isLoading } = useNotifications({ limit: 25 });
  const markAllMut = useMarkAllNotificationsRead();
  const markOneMut = useMarkNotificationRead();

  const items = data?.notifications ?? [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/super-admin/settings"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Platform Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review system alerts for new institution registrations and
            subscription payments.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={markAllMut.isPending}
            onClick={() => markAllMut.mutate()}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="p-6">
            <LoadingState message="Loading notifications..." />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="System alerts for school approvals and payments will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-4 p-4 ${
                  n.isRead ? "opacity-75" : "bg-primary/5"
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={markOneMut.isPending}
                    onClick={() => markOneMut.mutate(n.id)}
                  >
                    Mark read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

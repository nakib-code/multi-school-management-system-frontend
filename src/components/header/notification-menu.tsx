"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/features/notifications/hooks";

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications({ page: 1, limit: 6 });
  const markReadMut = useMarkNotificationRead();
  const markAllMut = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-background p-4 shadow-lg sm:w-96">
            <div className="mb-3 flex items-center justify-between border-b pb-2.5">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  {unreadCount} unread
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllMut.mutate()}
                  disabled={markAllMut.isPending}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {isLoading ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center">
                <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No notifications yet.
                </p>
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.isRead) markReadMut.mutate(n.id);
                    }}
                    className={`w-full rounded-lg border p-2.5 text-left transition ${
                      n.isRead
                        ? "bg-background hover:bg-muted/30"
                        : "border-primary/30 bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 border-t pt-2.5 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import {
  Bell,
  CheckCheck,
  ClipboardCheck,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  unread: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    title: "New student admission",
    description: "A new student admission requires review.",
    time: "10 min ago",
    icon: UserPlus,
    unread: true,
  },
  {
    id: 2,
    title: "Payment received",
    description: "A student payment has been received.",
    time: "1 hour ago",
    icon: CreditCard,
    unread: true,
  },
  {
    id: 3,
    title: "Attendance updated",
    description: "Today's attendance has been updated.",
    time: "3 hours ago",
    icon: ClipboardCheck,
    unread: false,
  },
];

export function NotificationMenu() {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-background shadow-lg"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Notifications
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  You have {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    // API integration will be added later.
                  }}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={`flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60 ${
                        notification.unread
                          ? "bg-primary/[0.03]"
                          : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>

                          {notification.unread && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {notification.description}
                        </p>

                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <Bell className="mb-3 h-8 w-8 text-muted-foreground/50" />

                  <p className="text-sm font-medium">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    You&apos;re all caught up.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
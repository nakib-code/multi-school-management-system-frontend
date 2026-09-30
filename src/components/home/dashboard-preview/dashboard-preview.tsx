import {
  Bell,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Users,
} from "lucide-react";

import { ActivityItem } from "./activity-item";
import { DashboardStat } from "./dashboard-stat";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Glow */}
      <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />

      {/* Dashboard */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-semibold">Greenfield School</p>

              <p className="text-[10px] text-muted-foreground">
                Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
            </button>

            <div className="hidden items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 sm:flex">
              <div className="h-5 w-5 rounded-full bg-primary/20" />

              <span className="text-[10px] font-medium">Admin</span>

              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 p-4 sm:p-5">
          {/* Overview */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
                Overview
              </p>

              <h3 className="mt-1 text-lg font-bold tracking-tight">
                School Dashboard
              </h3>
            </div>

            <div className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 sm:flex">
              <CalendarDays className="h-3 w-3 text-muted-foreground" />

              <span className="text-[10px] text-muted-foreground">
                This month
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <DashboardStat
              label="Total Students"
              value="1,248"
              description="+8.2% this month"
            />

            <DashboardStat
              label="Teachers"
              value="86"
              description="12 active today"
            />

            <DashboardStat
              label="Attendance"
              value="94.8%"
              description="+2.4% this week"
            />

            <DashboardStat
              label="Fees Collected"
              value="৳84.5K"
              description="This month"
            />
          </div>

          {/* Activity + Attendance */}
          <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
            {/* Recent Activity */}
            <div className="rounded-xl border border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">Recent Activity</p>

                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Latest updates
                  </p>
                </div>

                <Users className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <ActivityItem
                  title="New admission approved"
                  description="Student #ST-1048"
                  time="2m"
                />

                <ActivityItem
                  title="Payment received"
                  description="Monthly tuition fee"
                  time="18m"
                />

                <ActivityItem
                  title="Result published"
                  description="Class 8 — Mid Term"
                  time="1h"
                />
              </div>
            </div>

            {/* Attendance */}
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold">Attendance</p>

              <div className="mt-5 flex items-center justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-primary/20">
                  <div className="absolute inset-[-10px] rotate-[-25deg] rounded-full border-[10px] border-transparent border-r-primary border-t-primary" />

                  <div className="text-center">
                    <p className="text-xl font-bold">94.8%</p>

                    <p className="text-[9px] text-muted-foreground">
                      Present
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-[10px] text-muted-foreground">
                <span>Present</span>
                <span>Absent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stat */}
      <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-border bg-background p-3 shadow-xl sm:block">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground">
              Active schools
            </p>

            <p className="text-sm font-bold">120+</p>
          </div>
        </div>
      </div>
    </div>
  );
}

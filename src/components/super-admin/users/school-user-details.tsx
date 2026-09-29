"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";


import type { SchoolUserSummary } from "@/features/super-admin/users/types";
import { USER_CATEGORIES, UserCategoryKey } from "@/features/super-admin/users/constants";

interface SchoolUserDetailsProps {
  data: SchoolUserSummary;
  onBack: () => void;
  onSelectCategory: (role: UserCategoryKey) => void;
}

export function SchoolUserDetails({
  data,
  onBack,
  onSelectCategory,
}: SchoolUserDetailsProps) {
  const { school, counts } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
            aria-label="Back to schools"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-sm text-muted-foreground">School Users</p>

            <h2 className="text-2xl font-semibold tracking-tight">
              {school.name}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{school.code}</span>
              <span>•</span>
              <span
                className={
                  school.status === "ACTIVE"
                    ? "font-medium text-green-600"
                    : "font-medium"
                }
              >
                {school.status}
              </span>
            </div>
          </div>
        </div>

        {/* Total users */}
        <div className="rounded-xl border bg-background px-5 py-3">
          <p className="text-xs text-muted-foreground">Total Users</p>
          <p className="mt-1 text-2xl font-semibold">{counts.total}</p>
        </div>
      </div>

      {/* Category cards (clickable) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {USER_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const count = counts[category.key];

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onSelectCategory(category.key)}
              className="rounded-xl border bg-background p-5 text-left transition hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <span className="text-2xl font-semibold">{count}</span>
              </div>

              <h3 className="mt-4 font-medium">{category.label}</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Category list (clickable) */}
      <div className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">User Categories</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage users by their role within {school.name}.
          </p>
        </div>

        <div className="divide-y">
          {USER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = counts[category.key];

            return (
              <button
                key={category.key}
                type="button"
                onClick={() => onSelectCategory(category.key)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">{category.label}</p>

                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                    {count}
                  </span>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import {
  ArrowLeft,
  Building2,
  Users,
} from "lucide-react";

import {
  USER_CATEGORIES,
  type UserCategoryKey,
} from "@/features/super-admin/users/constants";

import type { SchoolUserSummary } from "@/features/super-admin/users/types";

interface SchoolUserDetailsProps {
  data: SchoolUserSummary;
  onBack: () => void;
  onSelectCategory: (
    role: UserCategoryKey,
  ) => void;
}

export function SchoolUserDetails({
  data,
  onBack,
  onSelectCategory,
}: SchoolUserDetailsProps) {
  const { school, counts } = data;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to schools
      </button>

      {/* School Header */}
      <div className="rounded-xl border bg-background">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {school.name}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">
                  {school.code}
                </span>

                <span>•</span>

                <span className="capitalize">
                  {school.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />

              <span className="text-xs font-medium">
                Total Users
              </span>
            </div>

            <p className="mt-1 text-2xl font-bold">
              {counts.total}
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            User Categories
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a category to view users from this school.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {USER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = counts[category.key];

            return (
              <button
                key={category.key}
                type="button"
                onClick={() =>
                  onSelectCategory(category.key)
                }
                className="group rounded-xl border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                    <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>

                  <span className="text-2xl font-bold">
                    {count}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">
                    {category.label}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

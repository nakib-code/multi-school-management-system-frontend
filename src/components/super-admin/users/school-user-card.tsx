import { Building2, ChevronRight, Users } from "lucide-react";

import { USER_CATEGORIES } from "@/features/super-admin/users/constants";
import type { SchoolUserSummary } from "@/features/super-admin/users/types";

interface SchoolUserCardProps {
  school: SchoolUserSummary;
  onClick: () => void;
}

export function SchoolUserCard({ school, onClick }: SchoolUserCardProps) {
  const { counts } = school;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border bg-background p-5 text-left transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">{school.school.name}</h3>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {school.school.code}
            </p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />

        <span>
          {counts.total} {counts.total === 1 ? "User" : "Users"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {USER_CATEGORIES.map((category) => {
          const Icon = category.icon;

          return (
            <RoleCount
              key={category.key}
              label={category.label}
              count={counts[category.key]}
              icon={<Icon className="h-3.5 w-3.5" />}
            />
          );
        })}
      </div>
    </button>
  );
}

function RoleCount({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-2 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>

      <span className="font-semibold text-foreground">{count}</span>
    </div>
  );
}
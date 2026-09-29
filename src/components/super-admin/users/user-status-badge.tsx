import type { SchoolUserStatus } from "@/features/super-admin/users/types";

interface UserStatusBadgeProps {
  status: SchoolUserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
      />

      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
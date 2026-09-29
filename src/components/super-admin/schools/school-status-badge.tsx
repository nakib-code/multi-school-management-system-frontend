import type { SchoolStatus } from "@/types/school";

interface SchoolStatusBadgeProps {
  status: SchoolStatus;
}

const statusConfig: Record<
  SchoolStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  },

  ACTIVE: {
    label: "Active",
    className:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },

  BLOCKED: {
    label: "Blocked",
    className:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },

  REJECTED: {
    label: "Rejected",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
  },
};

export function SchoolStatusBadge({
  status,
}: SchoolStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

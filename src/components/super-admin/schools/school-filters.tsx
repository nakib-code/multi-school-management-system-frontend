"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { SchoolStatus } from "@/types/school";

interface SchoolFiltersProps {
  search: string;
  status?: SchoolStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: SchoolStatus) => void;
  onReset: () => void;
}

const statuses: {
  value: SchoolStatus;
  label: string;
}[] = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "BLOCKED",
    label: "Blocked",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
];

export function SchoolFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}: SchoolFiltersProps) {
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const hasFilters = Boolean(search || status);

  const handleReset = () => {
    setSearchInput("");
    onReset();
  };

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search by school name, code or email..."
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Status */}
        <select
          value={status ?? ""}
          onChange={(event) => {
            const value = event.target.value as SchoolStatus | "";

            onStatusChange(
              value === "" ? undefined : value,
            );
          }}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-44"
        >
          <option value="">All Statuses</option>

          {statuses.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

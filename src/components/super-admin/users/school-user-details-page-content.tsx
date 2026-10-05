"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  type UserCategoryKey,
} from "@/features/super-admin/users/constants";
import {
  useSchoolUserSummary,
} from "@/features/super-admin/users/hooks";

import { SchoolUserDetails } from "./school-user-details";

interface SchoolUserDetailsPageContentProps {
  schoolId: number;
}

export function SchoolUserDetailsPageContent({
  schoolId,
}: SchoolUserDetailsPageContentProps) {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useSchoolUserSummary(schoolId);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading school users...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">
          Failed to load school details.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          The school may not exist or something went wrong.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/dashboard/super-admin/schools");
  };

  const handleSelectCategory = (role: UserCategoryKey) => {
    router.push("/dashboard/super-admin/users");
  };

  return (
    <SchoolUserDetails
      data={data}
      onBack={handleBack}
      onSelectCategory={handleSelectCategory}
    />
  );
}

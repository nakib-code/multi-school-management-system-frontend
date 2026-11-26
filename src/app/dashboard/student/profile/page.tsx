"use client";

import { StudentProfileView } from "@/components/school-modules/student-profile-view";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { useMyStudentProfile } from "@/features/students/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const { data: profile, isLoading, isError, error, refetch } =
    useMyStudentProfile(schoolId);

  if (isLoading) return <LoadingState message="Loading your profile..." />;
  if (isError || !profile) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load student profile")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <StudentProfileView schoolId={schoolId} student={profile} canEdit={false} />
  );
}

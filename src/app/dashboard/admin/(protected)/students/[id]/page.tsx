"use client";

import { useParams } from "next/navigation";
import { StudentProfileView } from "@/components/school-modules/student-profile-view";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { useStudentById } from "@/features/students/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function AdminStudentProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const studentId = Number(params?.id ?? 0);

  const { data, isLoading, isError, error, refetch } = useStudentById(
    schoolId,
    studentId,
  );

  if (isLoading) return <LoadingState message="Loading student profile..." />;
  if (isError || !data) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load student profile")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <StudentProfileView
      schoolId={schoolId}
      student={data}
      canEdit={user?.role === "ADMIN" || user?.role === "MANAGER"}
      backHref={
        user?.role === "MANAGER"
          ? "/dashboard/manager/students"
          : "/dashboard/admin/students"
      }
    />
  );
}

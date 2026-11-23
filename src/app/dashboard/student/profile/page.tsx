"use client";

import { UserCheck } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { FileUpload } from "@/components/shared/file-upload";
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
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load student profile")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Student Profile</h1>
          <p className="text-sm text-muted-foreground">
            Official academic record linked to your institution.
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Full Name</p>
          <p className="mt-1 font-medium">
            {profile ? `${profile.firstName} ${profile.lastName ?? ""}` : user?.name}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Student ID</p>
          <p className="mt-1 font-mono font-semibold">{profile?.studentId ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Email</p>
          <p className="mt-1">{profile?.user?.email ?? user?.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Phone</p>
          <p className="mt-1">{profile?.phone ?? user?.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Gender</p>
          <p className="mt-1">{profile?.gender ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Admission Date</p>
          <p className="mt-1">
            {profile?.admissionDate
              ? new Date(profile.admissionDate).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase text-muted-foreground">Address</p>
          <p className="mt-1">{profile?.address ?? "—"}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <FileUpload
          category="USER_AVATAR"
          label="Profile Photo"
          accept="image/jpeg,image/png,image/webp"
          maxSizeMb={5}
        />
      </div>
    </div>
  );
}

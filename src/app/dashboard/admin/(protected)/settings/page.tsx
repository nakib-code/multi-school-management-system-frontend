"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  useAdmissionFee,
  useUpdateAdmissionFee,
} from "@/features/admin/settings/hooks";
import { admissionFeeSchema } from "@/features/admin/settings/schema";
import { useAuth } from "@/providers/auth-provider";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const schoolId = user?.schoolId ?? null;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useAdmissionFee(schoolId);

  const updateMutation = useUpdateAdmissionFee(schoolId);

  const [admissionFee, setAdmissionFee] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (data) {
      setAdmissionFee(String(data.admissionFee));
    }
  }, [data]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setValidationError("");

    const fee = Number(admissionFee);

    const result = admissionFeeSchema.safeParse({
      admissionFee: fee,
    });

    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ??
          "Please enter a valid admission fee.",
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({
        admissionFee: result.data.admissionFee,
      });
    } catch {
      // Error is already handled by updateMutation.isError
    }
  };

  if (!schoolId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-destructive" />

          <h1 className="mt-3 text-lg font-semibold">
            School information not found
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Your account is not connected to a school.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-6 w-6 text-destructive" />

          <h1 className="mt-4 text-xl font-semibold">
            Unable to load settings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            We could not load your school settings.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              School Admin
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Settings
            </h1>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage settings for your school.
        </p>
      </div>

      {/* Admission Fee */}
      <section className="max-w-2xl rounded-2xl border bg-background shadow-sm">
        <div className="border-b p-6">
          <h2 className="font-semibold">
            Admission Fee
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Set the admission fee students need to pay when
            applying to your school.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          <div className="max-w-sm">
            <label
              htmlFor="admissionFee"
              className="text-sm font-medium"
            >
              Admission Fee
            </label>

            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ৳
              </span>

              <input
                id="admissionFee"
                type="number"
                min="1"
                max="1000000"
                step="0.01"
                value={admissionFee}
                onChange={(event) => {
                  setAdmissionFee(event.target.value);
                  setValidationError("");
                  updateMutation.reset();
                }}
                placeholder="500"
                className="h-11 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Enter the amount in Bangladeshi Taka.
            </p>

            {validationError && (
              <p className="mt-2 text-sm text-destructive">
                {validationError}
              </p>
            )}
          </div>

          {updateMutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Admission fee updated successfully.
            </div>
          )}

          {updateMutation.isError && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Failed to update admission fee. Please try
              again.
            </div>
          )}

          <button
            type="submit"
            disabled={
              updateMutation.isPending ||
              !admissionFee
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

"use client";

import { Loader2, Sliders } from "lucide-react";
import {
  type SchoolFeatures,
  useSchoolFeatures,
  useUpdateSchoolFeatures,
} from "@/features/school-settings/hooks";

type FeatureKey = keyof Omit<SchoolFeatures, "schoolId">;

const FEATURE_CONTROLS: {
  key: FeatureKey;
  title: string;
  description: string;
  badge?: string;
}[] = [
  {
    key: "hasGeneralSection",
    title: "General / Kindergarten Section",
    description:
      "Standard academic classes, sections, subjects, exams, and results.",
  },
  {
    key: "hasHefzSection",
    title: "Hefz & Najera Tracking",
    description:
      "Ustad-based Halqa enrollment and daily Sabak, Satsabak, and Amukhta logs.",
  },
  {
    key: "hasOnlineAdmission",
    title: "Online Admissions",
    description:
      "Public online admission form, application tracking, and review workflow.",
    badge: "Add-on",
  },
  {
    key: "hasTeacherPayroll",
    title: "Teacher Payroll & Salaries",
    description:
      "Monthly teacher salary generation, tracking, and disbursement.",
    badge: "Add-on",
  },
  {
    key: "smsEnabled",
    title: "SMS Notifications",
    description:
      "Automated attendance, fee reminder, and notice SMS alerts (Phase-2).",
    badge: "Phase-2",
  },
];

export function SchoolFeatureControls({ schoolId }: { schoolId: number }) {
  const { data: features, isLoading } = useSchoolFeatures(schoolId);
  const updateMutation = useUpdateSchoolFeatures(schoolId);

  const handleToggle = (key: FeatureKey, currentValue: boolean) => {
    updateMutation.mutate({ [key]: !currentValue });
  };

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Module &amp; Feature Controls
            </h2>
            <p className="text-sm text-muted-foreground">
              Enable or disable modules for this institution in one click.
            </p>
          </div>
        </div>
        {updateMutation.isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      {isLoading || !features ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading module settings...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURE_CONTROLS.map((item) => {
            const enabled = features[item.key];
            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-xl border bg-background p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${item.title}`}
                  disabled={updateMutation.isPending}
                  onClick={() => handleToggle(item.key, enabled)}
                  className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
                    enabled ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

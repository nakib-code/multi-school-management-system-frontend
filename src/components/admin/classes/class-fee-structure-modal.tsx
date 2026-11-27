"use client";

import { Loader2, Save, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useClassFeeStructures,
  useUpsertClassFeeStructures,
} from "@/features/admin/classes/hooks";
import type { SchoolClass } from "@/features/admin/classes/types";
import { ALL_FEE_TYPES, type FeeType } from "@/features/fees/types";
import { getApiErrorMessage } from "@/lib/api";

interface ClassFeeStructureModalProps {
  schoolId: number;
  schoolClass: SchoolClass | null;
  isAdmin: boolean;
  onClose: () => void;
}

export function ClassFeeStructureModal({
  schoolId,
  schoolClass,
  isAdmin,
  onClose,
}: ClassFeeStructureModalProps) {
  const [academicYear, setAcademicYear] = useState("");
  const [amounts, setAmounts] = useState<Record<FeeType, string>>({
    ADMISSION: "",
    MONTHLY: "",
    EXAM: "",
    SESSION: "",
    TRANSPORT: "",
    LIBRARY: "",
    LAB: "",
    OTHER: "",
  });
  const [otherTitle, setOtherTitle] = useState("");

  const { data, isLoading } = useClassFeeStructures(
    schoolClass ? schoolId : 0,
    schoolClass
      ? {
          classId: schoolClass.id,
          ...(academicYear.trim() ? { academicYear: academicYear.trim() } : {}),
        }
      : undefined,
  );
  const upsertMutation = useUpsertClassFeeStructures(schoolId);

  const classData = data?.classes.find((c) => c.id === schoolClass?.id);
  const schoolDefaultAdmissionFee = data?.schoolDefaultAdmissionFee ?? 0;

  useEffect(() => {
    if (!classData) return;
    const targetYear = academicYear.trim() || null;
    const next: Record<FeeType, string> = {
      ADMISSION: "",
      MONTHLY: "",
      EXAM: "",
      SESSION: "",
      TRANSPORT: "",
      LIBRARY: "",
      LAB: "",
      OTHER: "",
    };
    let nextOtherTitle = "";
    for (const ft of ALL_FEE_TYPES) {
      const exact = classData.feeStructures.find(
        (s) => s.feeType === ft.value && s.academicYear === targetYear,
      );
      const fallback = !targetYear
        ? classData.feeStructures.find(
            (s) => s.feeType === ft.value && s.academicYear === null,
          )
        : undefined;
      const row = exact ?? fallback;
      if (row) {
        next[ft.value] = String(row.amount);
        if (ft.value === "OTHER" && row.title) {
          nextOtherTitle = row.title;
        }
      }
    }
    setAmounts(next);
    setOtherTitle(nextOtherTitle);
  }, [classData, academicYear]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolClass || !isAdmin) return;

    const items = ALL_FEE_TYPES.map((ft) => {
      const raw = amounts[ft.value].trim();
      const parsed = raw === "" ? null : Number(raw);
      return {
        feeType: ft.value,
        amount:
          parsed !== null && Number.isFinite(parsed) && parsed >= 0
            ? parsed
            : null,
        title:
          ft.value === "OTHER" && otherTitle.trim() ? otherTitle.trim() : null,
      };
    });

    try {
      await upsertMutation.mutateAsync({
        classId: schoolClass.id,
        payload: {
          academicYear: academicYear.trim() || null,
          items,
        },
      });
      toast.success(`Fee structure saved for ${schoolClass.name}`);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save fee structure"));
    }
  };

  return (
    <Modal
      open={Boolean(schoolClass)}
      onClose={onClose}
      title={
        schoolClass ? `Fee Structure — ${schoolClass.name}` : "Fee Structure"
      }
      description="Leave any field blank to fall back (Admission falls back to School Default; other fee types remain manual)."
      maxWidthClass="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading class fee structure...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span>
                School Default Admission Fee:{" "}
                <strong>৳{schoolDefaultAdmissionFee.toLocaleString()}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cfs-year" className="text-xs">
                Academic Year (optional):
              </Label>
              <Input
                id="cfs-year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="All years"
                className="h-8 w-28 text-xs"
              />
            </div>
          </div>

          <fieldset disabled={!isAdmin} className="grid gap-3 sm:grid-cols-2">
            {ALL_FEE_TYPES.map((ft) => (
              <div key={ft.value} className="space-y-1">
                <Label htmlFor={`cfs-${ft.value}`} className="text-xs">
                  {ft.label} (BDT)
                </Label>
                <Input
                  id={`cfs-${ft.value}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={amounts[ft.value]}
                  onChange={(e) =>
                    setAmounts((prev) => ({
                      ...prev,
                      [ft.value]: e.target.value,
                    }))
                  }
                  placeholder={
                    ft.value === "ADMISSION"
                      ? `Fallback: ৳${schoolDefaultAdmissionFee}`
                      : "Not set"
                  }
                />
              </div>
            ))}

            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="cfs-other-title" className="text-xs">
                Custom / Other Fee Label (Optional)
              </Label>
              <Input
                id="cfs-other-title"
                value={otherTitle}
                onChange={(e) => setOtherTitle(e.target.value)}
                placeholder="e.g. Development / Sports / Computer Fee"
              />
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {isAdmin && (
              <Button
                type="submit"
                disabled={upsertMutation.isPending}
                className="gap-1.5"
              >
                {upsertMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Fee Structure
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}

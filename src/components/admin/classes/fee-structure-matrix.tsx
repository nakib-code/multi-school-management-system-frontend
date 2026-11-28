"use client";

import { Loader2, Save, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useClassFeeStructures,
  useUpsertClassFeeStructures,
} from "@/features/admin/classes/hooks";
import { ALL_FEE_TYPES, type FeeType } from "@/features/fees/types";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";

interface FeeStructureMatrixProps {
  schoolId: number;
  isAdmin: boolean;
}

export function FeeStructureMatrix({
  schoolId,
  isAdmin,
}: FeeStructureMatrixProps) {
  const [academicYear, setAcademicYear] = useState("");
  const debouncedAcademicYear = useDebounce(academicYear.trim(), 350);
  const queryAcademicYear =
    debouncedAcademicYear.length >= 4 ? debouncedAcademicYear : undefined;
  const [savingClassId, setSavingClassId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Record<FeeType, string>>>(
    {},
  );

  const { data, isLoading } = useClassFeeStructures(
    schoolId,
    queryAcademicYear ? { academicYear: queryAcademicYear } : undefined,
  );
  const upsertMutation = useUpsertClassFeeStructures(schoolId);

  const classes = data?.classes ?? [];
  const schoolDefaultAdmissionFee = data?.schoolDefaultAdmissionFee ?? 0;

  useEffect(() => {
    if (!data) return;
    const targetYear = queryAcademicYear ?? null;
    const nextDrafts: Record<number, Record<FeeType, string>> = {};
    for (const cls of data.classes) {
      const rowMap: Record<FeeType, string> = {
        ADMISSION: "",
        MONTHLY: "",
        EXAM: "",
        SESSION: "",
        TRANSPORT: "",
        LIBRARY: "",
        LAB: "",
        OTHER: "",
      };
      for (const ft of ALL_FEE_TYPES) {
        const exact = cls.feeStructures.find(
          (s) => s.feeType === ft.value && s.academicYear === targetYear,
        );
        const fallback = !targetYear
          ? cls.feeStructures.find(
              (s) => s.feeType === ft.value && s.academicYear === null,
            )
          : undefined;
        const item = exact ?? fallback;
        if (item) {
          rowMap[ft.value] = String(item.amount);
        }
      }
      nextDrafts[cls.id] = rowMap;
    }
    setDrafts(nextDrafts);
  }, [data, queryAcademicYear]);

  const handleSaveRow = async (classId: number, className: string) => {
    if (!isAdmin) return;
    const row = drafts[classId];
    if (!row) return;
    const trimmedYear = academicYear.trim();
    if (trimmedYear.length > 0 && trimmedYear.length < 4) {
      toast.error(
        "Academic year must be at least 4 characters (e.g. 2026) or left blank.",
      );
      return;
    }
    setSavingClassId(classId);
    try {
      const items = ALL_FEE_TYPES.map((ft) => {
        const raw = (row[ft.value] ?? "").trim();
        const parsed = raw === "" ? null : Number(raw);
        return {
          feeType: ft.value,
          amount:
            parsed !== null && Number.isFinite(parsed) && parsed >= 0
              ? parsed
              : null,
        };
      });
      await upsertMutation.mutateAsync({
        classId,
        payload: {
          academicYear: trimmedYear || null,
          items,
        },
      });
      toast.success(`Saved fee structure for ${className}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save class fees"));
    } finally {
      setSavingClassId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading class fee matrix...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Class-Wise Fee Structure Matrix</h2>
            <p className="text-xs text-muted-foreground">
              Set default fees per class across all fee types. Blank Admission
              fields automatically fall back to the School Default (৳
              {schoolDefaultAdmissionFee.toLocaleString()}).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Academic Year:</span>
          <Input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Default (All)"
            className="h-8 w-32 text-xs"
          />
        </div>
      </div>

      {classes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No classes found. Create classes first to configure fee structures.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-xs">
            <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Class</th>
                {ALL_FEE_TYPES.map((ft) => (
                  <th key={ft.value} className="px-2 py-2.5">
                    {ft.label.replace(" Fee", "")}
                  </th>
                ))}
                {isAdmin && <th className="px-3 py-2.5 text-right">Save</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.map((cls) => {
                const row = drafts[cls.id];
                return (
                  <tr key={cls.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2.5 font-medium">
                      <div>{cls.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {cls.code}
                      </div>
                    </td>
                    {ALL_FEE_TYPES.map((ft) => (
                      <td key={ft.value} className="px-1.5 py-2">
                        <Input
                          type="number"
                          min={0}
                          disabled={!isAdmin}
                          value={row?.[ft.value] ?? ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [cls.id]: {
                                ...(prev[cls.id] ?? {
                                  ADMISSION: "",
                                  MONTHLY: "",
                                  EXAM: "",
                                  SESSION: "",
                                  TRANSPORT: "",
                                  LIBRARY: "",
                                  LAB: "",
                                  OTHER: "",
                                }),
                                [ft.value]: e.target.value,
                              },
                            }))
                          }
                          placeholder={
                            ft.value === "ADMISSION"
                              ? `৳${schoolDefaultAdmissionFee}`
                              : "—"
                          }
                          className="h-8 w-24 text-xs"
                        />
                      </td>
                    ))}
                    {isAdmin && (
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={savingClassId === cls.id}
                          onClick={() => void handleSaveRow(cls.id, cls.name)}
                          className="h-8 gap-1 px-2.5 text-xs"
                        >
                          {savingClassId === cls.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

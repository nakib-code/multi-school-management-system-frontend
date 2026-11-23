"use client";

import { Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateSalaryPayment,
  useCreateTeacherSalary,
  useTeacherSalaries,
} from "@/features/salaries/hooks";
import type { SalaryPaymentMethod, TeacherSalaryRecord } from "@/features/salaries/types";
import { useTeachers } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function SalariesWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data: salaries = [], isLoading, isError, error, refetch } =
    useTeacherSalaries(schoolId);
  const { data: teachers = [] } = useTeachers(canManage ? schoolId : 0);

  const createSalMut = useCreateTeacherSalary(schoolId);
  const paySalMut = useCreateSalaryPayment(schoolId);

  const [createOpen, setCreateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<TeacherSalaryRecord | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<SalaryPaymentMethod>("BANK");

  const [form, setForm] = useState({
    teacherId: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    basicSalary: "",
    bonus: "0",
    deduction: "0",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSalMut.mutateAsync({
      teacherId: Number(form.teacherId),
      month: Number(form.month),
      year: Number(form.year),
      basicSalary: Number(form.basicSalary),
      bonus: Number(form.bonus) || 0,
      deduction: Number(form.deduction) || 0,
    });
    setCreateOpen(false);
    setForm((prev) => ({ ...prev, basicSalary: "", bonus: "0", deduction: "0" }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;
    await paySalMut.mutateAsync({
      teacherId: payTarget.teacherId,
      salaryId: payTarget.id,
      amount: Number(payAmount || payTarget.netSalary),
      paymentMethod: payMethod,
    });
    setPayTarget(null);
  };

  if (isLoading) return <LoadingState message="Loading teacher salaries..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load salaries")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Salaries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monthly payroll sheets, bonuses, deductions, and disbursement tracking.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Generate Salary
          </Button>
        )}
      </div>

      {salaries.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No salary sheets yet"
          description="Monthly teacher payroll records will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Month / Year</th>
                <th className="px-4 py-3">Basic / Bonus / Ded.</th>
                <th className="px-4 py-3">Net Salary</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {salaries.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">
                    {s.teacher
                      ? `${s.teacher.firstName} ${s.teacher.lastName ?? ""}`
                      : `Teacher #${s.teacherId}`}
                  </td>
                  <td className="px-4 py-3">
                    {s.month}/{s.year}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    ৳{Number(s.basicSalary).toLocaleString()} + ৳{Number(s.bonus).toLocaleString()} − ৳{Number(s.deduction).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ৳{Number(s.netSalary).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {s.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      {s.status !== "PAID" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPayTarget(s);
                            setPayAmount(String(s.netSalary));
                          }}
                        >
                          Record Payment
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Generate Teacher Salary">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <Label>Teacher</Label>
            <select
              required
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName ?? ""} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Month (1–12)</Label>
              <Input
                type="number"
                min={1}
                max={12}
                required
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Year</Label>
              <Input
                type="number"
                min={2020}
                required
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Basic (BDT)</Label>
              <Input
                type="number"
                min={1}
                required
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Bonus</Label>
              <Input
                type="number"
                min={0}
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Deduction</Label>
              <Input
                type="number"
                min={0}
                value={form.deduction}
                onChange={(e) => setForm({ ...form, deduction: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSalMut.isPending}>
              Create Salary
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        title="Record Salary Disbursement"
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handlePay} className="space-y-4">
          <div className="space-y-1">
            <Label>Amount (BDT)</Label>
            <Input
              type="number"
              min={1}
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Payment Method</Label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as SalaryPaymentMethod)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank Transfer</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={paySalMut.isPending}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

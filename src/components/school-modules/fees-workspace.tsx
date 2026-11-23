"use client";

import { CheckCircle2, CreditCard, Plus, Smartphone, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEnrollments } from "@/features/enrollments/hooks";
import {
  useCreateStudentFee,
  useDeleteStudentFee,
  useRejectStudentPayment,
  useStudentFees,
  useStudentPayments,
  useSubmitStudentPayment,
  useVerifyStudentPayment,
} from "@/features/fees/hooks";
import type { FeeType, StudentFeeRecord } from "@/features/fees/types";
import type { MobilePaymentMethod } from "@/features/payments/types";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function FeesWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";

  const [tab, setTab] = useState<"fees" | "payments">("fees");
  const [createOpen, setCreateOpen] = useState(false);
  const [payFee, setPayFee] = useState<StudentFeeRecord | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [feeForm, setFeeForm] = useState({
    enrollmentId: "",
    feeType: "MONTHLY" as FeeType,
    title: "",
    amount: "",
    dueDate: "",
  });

  const [payForm, setPayForm] = useState({
    paymentMethod: "BKASH" as MobilePaymentMethod,
    senderNumber: "",
    trxId: "",
    paidAmount: "",
    remarks: "",
  });

  const feesQuery = useStudentFees(schoolId);
  const paymentsQuery = useStudentPayments(schoolId);
  const { data: enrollments = [] } = useEnrollments(canManage ? schoolId : 0);

  const createFeeMut = useCreateStudentFee(schoolId);
  const deleteFeeMut = useDeleteStudentFee(schoolId);
  const submitPayMut = useSubmitStudentPayment(schoolId);
  const verifyPayMut = useVerifyStudentPayment(schoolId);
  const rejectPayMut = useRejectStudentPayment(schoolId);

  if (feesQuery.isLoading) return <LoadingState message="Loading fees & payments..." />;
  if (feesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(feesQuery.error, "Failed to load fees")}
        onRetry={() => feesQuery.refetch()}
      />
    );
  }

  const fees = feesQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const en = enrollments.find((item) => item.id === Number(feeForm.enrollmentId));
    if (!en) return;
    await createFeeMut.mutateAsync({
      studentId: en.studentId,
      enrollmentId: en.id,
      feeType: feeForm.feeType,
      title: feeForm.title.trim(),
      amount: Number(feeForm.amount),
      dueDate: feeForm.dueDate,
    });
    setCreateOpen(false);
    setFeeForm({ enrollmentId: "", feeType: "MONTHLY", title: "", amount: "", dueDate: "" });
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFee) return;
    await submitPayMut.mutateAsync({
      studentId: payFee.studentId,
      feeId: payFee.id,
      paymentMethod: payForm.paymentMethod,
      senderNumber: payForm.senderNumber.trim(),
      trxId: payForm.trxId.trim(),
      paidAmount: Number(payForm.paidAmount || payFee.amount),
      ...(payForm.remarks.trim() ? { remarks: payForm.remarks.trim() } : {}),
    });
    setPayFee(null);
    setPayForm({ paymentMethod: "BKASH", senderNumber: "", trxId: "", paidAmount: "", remarks: "" });
  };

  const handleReject = async () => {
    if (!rejectId || rejectReason.trim().length < 3) return;
    await rejectPayMut.mutateAsync({ id: rejectId, rejectionReason: rejectReason.trim() });
    setRejectId(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Fees &amp; Mobile Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage fee invoices and manual bKash, Nagad, and Rocket fee payments.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Fee Invoice
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setTab("fees")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "fees"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Fee Invoices ({fees.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("payments")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "payments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Payment Submissions ({payments.length})
        </button>
      </div>

      {tab === "fees" ? (
        fees.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No fee invoices yet"
            description="Issued student tuition, exam, and other fees will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Fee Title</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-3 font-medium">
                      {f.student
                        ? `${f.student.firstName} ${f.student.lastName ?? ""}`
                        : `Student #${f.studentId}`}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.feeType}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ৳{Number(f.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {f.status !== "PAID" && f.status !== "WAIVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPayFee(f);
                              setPayForm((prev) => ({
                                ...prev,
                                paidAmount: String(f.amount),
                              }));
                            }}
                            className="gap-1"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            Submit Payment
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteFeeMut.mutate(f.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No payment submissions yet"
          description="Manual bKash, Nagad, and Rocket fee submissions will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Method &amp; TrxID</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Verify</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">
                    {p.student
                      ? `${p.student.firstName} ${p.student.lastName ?? ""}`
                      : `Student #${p.studentId}`}
                    <p className="text-xs text-muted-foreground">{p.fee?.title ?? ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{p.paymentMethod}</span>
                    <p className="font-mono text-xs text-muted-foreground">{p.trxId}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.senderNumber}</td>
                  <td className="px-4 py-3 font-medium">
                    ৳{Number(p.paidAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {p.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      {p.status === "PENDING" ? (
                        <div className="inline-flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => verifyPayMut.mutate(p.id)}
                            disabled={verifyPayMut.isPending}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectId(p.id)}
                            className="gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Reviewed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Student Fee">
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div className="space-y-1">
            <Label>Enrolled Student</Label>
            <select
              required
              value={feeForm.enrollmentId}
              onChange={(e) => setFeeForm({ ...feeForm, enrollmentId: e.target.value })}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select enrollment...</option>
              {enrollments.map((en) => (
                <option key={en.id} value={en.id}>
                  {en.student
                    ? `${en.student.firstName} ${en.student.lastName ?? ""} (${en.class?.name ?? ""})`
                    : `Enrollment #${en.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Fee Type</Label>
              <select
                value={feeForm.feeType}
                onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value as FeeType })}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="MONTHLY">Monthly Tuition</option>
                <option value="ADMISSION">Admission</option>
                <option value="EXAM">Exam Fee</option>
                <option value="TRANSPORT">Transport</option>
                <option value="LIBRARY">Library</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Amount (BDT)</Label>
              <Input
                type="number"
                min={1}
                required
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                required
                placeholder="November Tuition Fee"
                value={feeForm.title}
                onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                required
                value={feeForm.dueDate}
                onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFeeMut.isPending}>
              Create Fee
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!payFee}
        onClose={() => setPayFee(null)}
        title="Submit Manual Fee Payment"
        description={payFee ? `${payFee.title} — ৳${Number(payFee.amount).toLocaleString()}` : ""}
      >
        <form onSubmit={handlePaySubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Payment Method</Label>
            <select
              value={payForm.paymentMethod}
              onChange={(e) =>
                setPayForm({ ...payForm, paymentMethod: e.target.value as MobilePaymentMethod })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="ROCKET">Rocket</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Sender Number</Label>
              <Input
                required
                placeholder="01XXXXXXXXX"
                value={payForm.senderNumber}
                onChange={(e) => setPayForm({ ...payForm, senderNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Transaction ID (TrxID)</Label>
              <Input
                required
                placeholder="e.g. 9K2L8M4N"
                value={payForm.trxId}
                onChange={(e) => setPayForm({ ...payForm, trxId: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Paid Amount (BDT)</Label>
            <Input
              type="number"
              min={1}
              required
              value={payForm.paidAmount}
              onChange={(e) => setPayForm({ ...payForm, paidAmount: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setPayFee(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitPayMut.isPending}>
              {submitPayMut.isPending ? "Submitting..." : "Submit Payment"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Reject Payment">
        <div className="space-y-4">
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejecting this TrxID..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectReason.trim().length < 3 || rejectPayMut.isPending}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

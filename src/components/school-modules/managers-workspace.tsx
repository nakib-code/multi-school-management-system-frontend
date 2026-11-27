"use client";

import {
  Copy,
  LockKeyhole,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ResetManagerPasswordResponse,
  useCreateManager,
  useDeleteManager,
  useManagers,
  useResetManagerPassword,
  useUpdateManager,
} from "@/features/managers/hooks";
import type { ManagerRecord } from "@/features/managers/types";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function ManagersWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const isAdmin = user?.role === "ADMIN";

  const {
    data: managers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useManagers(schoolId);
  const createMut = useCreateManager(schoolId);
  const updateMut = useUpdateManager(schoolId);
  const resetPasswordMut = useResetManagerPassword(schoolId);
  const deleteMut = useDeleteManager(schoolId);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    firstName: "",
    lastName: "",
    phone: "",
    designation: "",
  });

  const [editTarget, setEditTarget] = useState<ManagerRecord | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    designation: "",
    department: "",
  });

  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetResult, setResetResult] =
    useState<ResetManagerPasswordResponse | null>(null);

  const openEditModal = (m: ManagerRecord) => {
    setEditTarget(m);
    setEditForm({
      name: m.user?.name ?? `${m.firstName} ${m.lastName ?? ""}`.trim(),
      phone: m.phone ?? "",
      designation: m.designation ?? "",
      department:
        "department" in m && typeof m.department === "string"
          ? m.department
          : "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      payload: {
        name: editForm.name.trim(),
        ...(editForm.phone.trim() ? { phone: editForm.phone.trim() } : {}),
        ...(editForm.designation.trim()
          ? { designation: editForm.designation.trim() }
          : {}),
        ...(editForm.department.trim()
          ? { department: editForm.department.trim() }
          : {}),
      },
    });
    setEditTarget(null);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const res = await resetPasswordMut.mutateAsync({
      managerId: resetTarget.id,
      ...(resetPasswordVal.trim()
        ? { newPassword: resetPasswordVal.trim() }
        : {}),
    });
    setResetTarget(null);
    setResetPasswordVal("");
    setResetResult(res);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMut.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      employeeId: form.employeeId.trim(),
      firstName: form.firstName.trim(),
      ...(form.lastName ? { lastName: form.lastName.trim() } : {}),
      ...(form.phone ? { phone: form.phone.trim() } : {}),
      ...(form.designation ? { designation: form.designation.trim() } : {}),
    });
    setOpen(false);
    setForm({
      name: "",
      email: "",
      password: "",
      employeeId: "",
      firstName: "",
      lastName: "",
      phone: "",
      designation: "",
    });
  };

  if (isLoading) return <LoadingState message="Loading managers..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load managers")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Managers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage institution managers who assist with daily academic and fee
            operations.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Manager
          </Button>
        )}
      </div>

      {managers.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No managers yet"
          description="Create a manager account to delegate daily operations."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Designation</th>
                {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {managers.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-mono text-xs">
                    {m.employeeId}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {m.firstName} {m.lastName ?? ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">{m.designation ?? "—"}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(m)}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setResetTarget({
                              id: m.id,
                              name:
                                m.user?.name ??
                                `${m.firstName} ${m.lastName ?? ""}`.trim(),
                            })
                          }
                          className="gap-1"
                        >
                          <LockKeyhole className="h-3.5 w-3.5" />
                          Reset Password
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMut.mutate(m.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add New Manager">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Account Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Employee ID</Label>
              <Input
                required
                placeholder="MGR-001"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Password (min 8 chars)</Label>
              <Input
                type="password"
                minLength={8}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Designation</Label>
              <Input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating..." : "Create Manager"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Manager Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Manager"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Designation</Label>
              <Input
                value={editForm.designation}
                onChange={(e) =>
                  setEditForm({ ...editForm, designation: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Department</Label>
              <Input
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMut.isPending}>
              {updateMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Manager Password Modal */}
      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          setResetPasswordVal("");
        }}
        title={
          resetTarget
            ? `Reset Password — ${resetTarget.name}`
            : "Reset Manager Password"
        }
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              New Password (Optional — leave blank to auto-generate)
            </Label>
            <Input
              type="password"
              minLength={8}
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResetTarget(null);
                setResetPasswordVal("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resetPasswordMut.isPending}>
              {resetPasswordMut.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manager Temporary Password Confirmation Modal */}
      <Modal
        open={!!resetResult}
        onClose={() => setResetResult(null)}
        title="Manager Password Reset — Save Temporary Password"
        maxWidthClass="max-w-md"
      >
        {resetResult && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Share these credentials securely with{" "}
              <strong className="text-foreground">{resetResult.name}</strong>.
              This temporary password is shown only once.
            </p>

            <div className="space-y-2.5 rounded-[11px] border bg-muted/30 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{resetResult.email}</span>
              </div>
              {resetResult.phone && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{resetResult.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t pt-2">
                <span className="text-muted-foreground">Temp Password</span>
                <div className="flex items-center gap-1.5">
                  <code className="rounded bg-background px-2 py-0.5 font-mono text-sm font-bold text-primary">
                    {resetResult.temporaryPassword}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyText(
                        resetResult.temporaryPassword,
                        "Temporary password",
                      )
                    }
                    className="h-7 px-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setResetResult(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

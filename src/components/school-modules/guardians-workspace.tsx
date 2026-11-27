"use client";

import {
  HeartHandshake,
  Link2,
  LockKeyhole,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import {
  type GuardianCredentialsData,
  GuardianCredentialsModal,
} from "@/components/school-modules/guardian-credentials-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateGuardian,
  useDeleteGuardian,
  useGuardians,
  useLinkStudentToGuardian,
  useResetGuardianPassword,
  useUpdateGuardian,
} from "@/features/guardians/hooks";
import type { GuardianRecord } from "@/features/guardians/types";
import { useStudents } from "@/features/students/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const formatGuardianEmail = (email?: string | null) => {
  if (!email || email.endsWith("@madrasaos.local")) return "No email";
  return email;
};

export function GuardiansWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";

  const {
    data: guardians = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGuardians(schoolId);
  const { data: studentsData } = useStudents(schoolId, { page: 1, limit: 100 });
  const createMut = useCreateGuardian(schoolId);
  const updateMut = useUpdateGuardian(schoolId);
  const linkMut = useLinkStudentToGuardian(schoolId);
  const resetPasswordMut = useResetGuardianPassword(schoolId);
  const deleteMut = useDeleteGuardian(schoolId);

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GuardianRecord | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    relation: "",
    occupation: "",
    address: "",
    nid: "",
  });
  const [linkGuardianId, setLinkGuardianId] = useState<number | null>(null);
  const [linkStudentId, setLinkStudentId] = useState("");
  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
    phone: string;
  } | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [credentials, setCredentials] =
    useState<GuardianCredentialsData | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    relation: "Father",
    occupation: "",
    nid: "",
    address: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createMut.mutateAsync({
      name: form.name.trim(),
      phone: form.phone.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.password ? { password: form.password } : {}),
      ...(form.relation.trim() ? { relation: form.relation.trim() } : {}),
      ...(form.occupation.trim() ? { occupation: form.occupation.trim() } : {}),
      ...(form.nid.trim() ? { nid: form.nid.trim() } : {}),
      ...(form.address.trim() ? { address: form.address.trim() } : {}),
    });
    setOpen(false);
    const createdPhone = created.user?.phone ?? form.phone.trim();
    const createdPassword = created.temporaryPassword || form.password;
    if (createdPassword) {
      setCredentials({
        name: created.user?.name ?? form.name.trim(),
        phone: createdPhone,
        temporaryPassword: createdPassword,
      });
    }
    setForm({
      name: "",
      phone: "",
      email: "",
      password: "",
      relation: "Father",
      occupation: "",
      nid: "",
      address: "",
    });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const res = await resetPasswordMut.mutateAsync({
      guardianId: resetTarget.id,
      payload: {
        ...(resetPasswordVal.trim()
          ? { password: resetPasswordVal.trim() }
          : {}),
        mustChangePassword: true,
      },
    });
    setResetTarget(null);
    setResetPasswordVal("");
    setCredentials({
      name: res.name,
      phone: res.phone ?? resetTarget.phone,
      temporaryPassword: res.temporaryPassword,
    });
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkGuardianId || !linkStudentId) return;
    await linkMut.mutateAsync({
      guardianId: linkGuardianId,
      studentId: Number(linkStudentId),
    });
    setLinkGuardianId(null);
    setLinkStudentId("");
  };

  const openEditModal = (g: GuardianRecord) => {
    setEditTarget(g);
    setEditForm({
      name: g.user?.name ?? "",
      phone: g.user?.phone ?? "",
      relation: g.relation ?? "",
      occupation: g.occupation ?? "",
      address: g.address ?? "",
      nid: g.nid ?? "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      payload: {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        ...(editForm.relation.trim()
          ? { relation: editForm.relation.trim() }
          : {}),
        ...(editForm.occupation.trim()
          ? { occupation: editForm.occupation.trim() }
          : {}),
        ...(editForm.address.trim()
          ? { address: editForm.address.trim() }
          : {}),
        ...(editForm.nid.trim() ? { nid: editForm.nid.trim() } : {}),
      },
    });
    setEditTarget(null);
  };

  if (isLoading) return <LoadingState message="Loading guardians..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load guardians")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guardians</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phone-first parent/guardian accounts linked to one or more children.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Guardian
          </Button>
        )}
      </div>

      {guardians.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No guardians added yet"
          description="Guardians are auto-created on Quick Admission, or you can add one manually here."
        />
      ) : (
        <>
          {/* Mobile Guardian Cards */}
          <div className="space-y-2.5 md:hidden">
            {guardians.map((g) => (
              <div key={g.id} className="mobile-card space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {g.user?.name ?? `Guardian #${g.id}`}
                    </p>
                    <p className="text-muted-foreground">
                      {g.user?.phone ?? "—"} • {g.relation ?? "Guardian"}
                    </p>
                  </div>
                  {g.nid && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                      NID: {g.nid}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Children:{" "}
                  <span className="font-medium text-foreground">
                    {g.students && g.students.length > 0
                      ? g.students
                          .map((s) =>
                            s.student
                              ? `${s.student.firstName} (${s.student.studentId})`
                              : `#${s.studentId}`,
                          )
                          .join(", ")
                      : "None"}
                  </span>
                </p>
                {canManage && (
                  <div className="flex flex-wrap gap-2 border-t pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(g)}
                      className="min-h-[40px] flex-1 gap-1 rounded-[11px]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLinkGuardianId(g.id)}
                      className="min-h-[40px] flex-1 gap-1 rounded-[11px]"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Link Student
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setResetTarget({
                          id: g.id,
                          name: g.user?.name ?? `Guardian #${g.id}`,
                          phone: g.user?.phone ?? "",
                        })
                      }
                      className="min-h-[40px] flex-1 gap-1 rounded-[11px]"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />
                      Reset Password
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMut.mutate(g.id)}
                        className="min-h-[40px] rounded-[11px] text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone &amp; Email</th>
                  <th className="px-4 py-3">Relation &amp; NID</th>
                  <th className="px-4 py-3">Linked Students</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {guardians.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-medium">
                      {g.user?.name ?? `Guardian #${g.id}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {g.user?.phone ?? "—"}
                      </p>
                      <p>{formatGuardianEmail(g.user?.email)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p>{g.relation ?? "—"}</p>
                      {g.nid && (
                        <p className="text-muted-foreground">NID: {g.nid}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {g.students && g.students.length > 0
                        ? g.students
                            .map((s) =>
                              s.student
                                ? `${s.student.firstName} (${s.student.studentId})`
                                : `#${s.studentId}`,
                            )
                            .join(", ")
                        : "None"}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(g)}
                            className="gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLinkGuardianId(g.id)}
                            className="gap-1"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            Link Student
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setResetTarget({
                                id: g.id,
                                name: g.user?.name ?? `Guardian #${g.id}`,
                                phone: g.user?.phone ?? "",
                              })
                            }
                            className="gap-1"
                          >
                            <LockKeyhole className="h-3.5 w-3.5" />
                            Reset Password
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMut.mutate(g.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Guardian">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Guardian full name"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number *</Label>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Relation</Label>
              <Input
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                placeholder="Father / Mother / Guardian"
              />
            </div>
            <div className="space-y-1">
              <Label>NID (Optional)</Label>
              <Input
                value={form.nid}
                onChange={(e) => setForm({ ...form, nid: e.target.value })}
                placeholder="National ID number"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Email (Optional)</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="space-y-1">
              <Label>Password (Optional, min 6)</Label>
              <Input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Default: Madrasa@<last4>"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Occupation (Optional)</Label>
              <Input
                value={form.occupation}
                onChange={(e) =>
                  setForm({ ...form, occupation: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Address (Optional)</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
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
              {createMut.isPending ? "Creating..." : "Create Guardian"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!linkGuardianId}
        onClose={() => setLinkGuardianId(null)}
        title="Link Student to Guardian"
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleLink} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Select Student</Label>
            <select
              required
              value={linkStudentId}
              onChange={(e) => setLinkStudentId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Choose student...</option>
              {(studentsData?.students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName ?? ""} ({s.studentId})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkGuardianId(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={linkMut.isPending}>
              Link Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Guardian Password Modal */}
      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          setResetPasswordVal("");
        }}
        title={
          resetTarget
            ? `Reset Password — ${resetTarget.name}`
            : "Reset Guardian Password"
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
              minLength={6}
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              placeholder="Leave blank for strong temp password"
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
              {resetPasswordMut.isPending
                ? "Resetting..."
                : "Generate / Set Password"}
            </Button>
          </div>
        </form>
      </Modal>

      <GuardianCredentialsModal
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />

      {/* Edit Guardian Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Guardian"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number *</Label>
              <Input
                required
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Relation</Label>
              <Input
                value={editForm.relation}
                onChange={(e) =>
                  setEditForm({ ...editForm, relation: e.target.value })
                }
                placeholder="Father / Mother / Guardian"
              />
            </div>
            <div className="space-y-1">
              <Label>NID</Label>
              <Input
                value={editForm.nid}
                onChange={(e) =>
                  setEditForm({ ...editForm, nid: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Occupation</Label>
              <Input
                value={editForm.occupation}
                onChange={(e) =>
                  setEditForm({ ...editForm, occupation: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
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
    </div>
  );
}

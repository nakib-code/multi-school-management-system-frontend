"use client";

import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateManager,
  useDeleteManager,
  useManagers,
} from "@/features/managers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function ManagersWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const isAdmin = user?.role === "ADMIN";

  const { data: managers = [], isLoading, isError, error, refetch } =
    useManagers(schoolId);
  const createMut = useCreateManager(schoolId);
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
            Manage institution managers who assist with daily academic and fee operations.
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
                  <td className="px-4 py-3 font-mono text-xs">{m.employeeId}</td>
                  <td className="px-4 py-3 font-medium">
                    {m.firstName} {m.lastName ?? ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">{m.designation ?? "—"}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMut.mutate(m.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating..." : "Create Manager"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useClasses, useCreateClass, useDeleteClass, useToggleClassStatus, useUpdateClass } from "@/features/admin/classes/hooks";
import { CreateClassPayload, SchoolClass, UpdateClassPayload } from "@/features/admin/classes/types";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


interface ClassManagementProps {
  schoolId: number;
  onManageSections?: (schoolClass: SchoolClass) => void;
}

export function ClassManagement({
  schoolId,
  onManageSections,
}: ClassManagementProps) {
  const {
    data: classes = [],
    isLoading,
    isError,
    refetch,
  } = useClasses(schoolId);

  const createMutation =
    useCreateClass(schoolId);

  const updateMutation =
    useUpdateClass(schoolId);

  const toggleMutation =
    useToggleClassStatus(schoolId);

  const deleteMutation =
    useDeleteClass(schoolId);

  const [showForm, setShowForm] =
    useState(false);

  const [editingClass, setEditingClass] =
    useState<SchoolClass | null>(null);

  const [form, setForm] =
    useState<CreateClassPayload>({
      name: "",
      code: "",
      description: "",
    });

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
    });

    setEditingClass(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingClass(null);

    setForm({
      name: "",
      code: "",
      description: "",
    });

    setShowForm(true);
  };

  const openEditForm = (
    schoolClass: SchoolClass,
  ) => {
    setEditingClass(schoolClass);

    setForm({
      name: schoolClass.name,
      code: schoolClass.code,
      description:
        schoolClass.description ?? "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim();
    const description =
      form.description?.trim() ?? "";

    if (!name) {
      toast.error("Class name is required");
      return;
    }

    if (!code) {
      toast.error("Class code is required");
      return;
    }

    try {
      if (editingClass) {
        const payload: UpdateClassPayload = {
          name,
          code,
          description,
        };

        await updateMutation.mutateAsync({
          classId: editingClass.id,
          payload,
        });

        toast.success(
          "Class updated successfully",
        );
      } else {
        const payload: CreateClassPayload = {
          name,
          code,
          description,
        };

        await createMutation.mutateAsync(
          payload,
        );

        toast.success(
          "Class created successfully",
        );
      }

      resetForm();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Something went wrong",
      );
    }
  };

  const handleToggle = async (
    schoolClass: SchoolClass,
  ) => {
    try {
      await toggleMutation.mutateAsync(
        schoolClass.id,
      );

      toast.success(
        schoolClass.isActive
          ? "Class deactivated"
          : "Class activated",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to update class status",
      );
    }
  };

  const handleDelete = async (
    schoolClass: SchoolClass,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${schoolClass.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(
        schoolClass.id,
      );

      toast.success(
        "Class deleted successfully",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to delete class",
      );
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Class Management
          </h2>

          <p className="text-sm text-muted-foreground">
            Create and manage school classes.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-background p-5"
        >
          <div className="mb-5">
            <h3 className="font-semibold">
              {editingClass
                ? "Edit Class"
                : "Create Class"}
            </h3>

            <p className="text-sm text-muted-foreground">
              Enter the class information below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Class Name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Class 10"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Class Code
              </label>

              <input
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))
                }
                placeholder="e.g. CLASS-10"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm uppercase outline-none focus:border-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Optional description"
                rows={3}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {editingClass
                ? "Update Class"
                : "Create Class"}
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border">
          <AlertCircle className="h-6 w-6 text-destructive" />

          <p className="text-sm text-muted-foreground">
            Failed to load classes.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading &&
        !isError &&
        classes.length === 0 && (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border text-center">
            <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />

            <h3 className="font-medium">
              No classes found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first class to continue.
            </p>
          </div>
        )}

      {/* Table */}
      {!isLoading &&
        !isError &&
        classes.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      Class
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Code
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Sections
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Students
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {classes.map(
                    (schoolClass) => (
                      <tr
                        key={schoolClass.id}
                        className="hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {schoolClass.name}
                          </div>

                          {schoolClass.description && (
                            <div className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                              {
                                schoolClass.description
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs">
                          {schoolClass.code}
                        </td>

                        <td className="px-5 py-4">
                          {
                            schoolClass._count
                              ?.sections ?? 0
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            schoolClass._count
                              ?.enrollments ?? 0
                          }
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                schoolClass,
                              )
                            }
                            disabled={
                              toggleMutation.isPending
                            }
                            className={
                              schoolClass.isActive
                                ? "rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600"
                                : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                            }
                          >
                            {schoolClass.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {onManageSections && (
                              <button
                                type="button"
                                onClick={() =>
                                  onManageSections(
                                    schoolClass,
                                  )
                                }
                                title="Manage Sections"
                                className="rounded-md p-2 hover:bg-muted"
                              >
                                <BookOpen className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  schoolClass,
                                )
                              }
                              title="Edit"
                              className="rounded-md p-2 hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  schoolClass,
                                )
                              }
                              disabled={
                                deleteMutation.isPending
                              }
                              title="Delete"
                              className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}

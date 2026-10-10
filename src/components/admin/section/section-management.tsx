"use client";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useCreateSection,
  useDeleteSection,
  useSections,
  useToggleSectionStatus,
  useUpdateSection,
} from "../../../features/admin/classes/hooks";

import type {
  CreateSectionPayload,
  SchoolClass,
  SchoolSection,
  UpdateSectionPayload,
} from "../../../features/admin/classes/types";

interface SectionManagementProps {
  schoolId: number;
  schoolClass: SchoolClass;
  onBack: () => void;
}

export function SectionManagement({
  schoolId,
  schoolClass,
  onBack,
}: SectionManagementProps) {
  const {
    data: sections = [],
    isLoading,
    isError,
    refetch,
  } = useSections(
    schoolId,
    schoolClass.id,
  );

  const createMutation =
    useCreateSection(schoolId);

  const updateMutation =
    useUpdateSection(schoolId);

  const toggleMutation =
    useToggleSectionStatus(schoolId);

  const deleteMutation =
    useDeleteSection(schoolId);

  const [showForm, setShowForm] =
    useState(false);

  const [editingSection, setEditingSection] =
    useState<SchoolSection | null>(null);

  const [form, setForm] =
    useState<CreateSectionPayload>({
      classId: schoolClass.id,
      name: "",
      code: "",
      capacity: undefined,
      roomNumber: "",
    });

  const resetForm = () => {
    setForm({
      classId: schoolClass.id,
      name: "",
      code: "",
      capacity: undefined,
      roomNumber: "",
    });

    setEditingSection(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingSection(null);

    setForm({
      classId: schoolClass.id,
      name: "",
      code: "",
      capacity: undefined,
      roomNumber: "",
    });

    setShowForm(true);
  };

  const openEditForm = (
    section: SchoolSection,
  ) => {
    setEditingSection(section);

    setForm({
      classId: schoolClass.id,
      name: section.name,
      code: section.code,
      capacity:
        section.capacity ?? undefined,
      roomNumber:
        section.roomNumber ?? "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim();
    const roomNumber =
      form.roomNumber?.trim() ?? "";

    if (!name) {
      toast.error(
        "Section name is required",
      );
      return;
    }

    if (!code) {
      toast.error(
        "Section code is required",
      );
      return;
    }

    if (
      form.capacity !== undefined &&
      form.capacity !== null &&
      (!Number.isInteger(form.capacity) ||
        form.capacity <= 0)
    ) {
      toast.error(
        "Capacity must be a positive number",
      );
      return;
    }

    try {
      if (editingSection) {
        const payload: UpdateSectionPayload = {
          name,
          code,
          capacity:
            form.capacity ?? null,
          roomNumber: roomNumber || null,
        };

        await updateMutation.mutateAsync({
          sectionId:
            editingSection.id,
          payload,
        });

        toast.success(
          "Section updated successfully",
        );
      } else {
        const payload: CreateSectionPayload = {
          classId: schoolClass.id,
          name,
          code,
          ...(form.capacity !== undefined && {
            capacity: form.capacity,
          }),
          ...(roomNumber && {
            roomNumber,
          }),
        };

        await createMutation.mutateAsync(
          payload,
        );

        toast.success(
          "Section created successfully",
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
    section: SchoolSection,
  ) => {
    try {
      await toggleMutation.mutateAsync(
        section.id,
      );

      toast.success(
        section.isActive
          ? "Section deactivated"
          : "Section activated",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to update section status",
      );
    }
  };

  const handleDelete = async (
    section: SchoolSection,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${section.name}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(
        section.id,
      );

      toast.success(
        "Section deleted successfully",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to delete section",
      );
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background hover:bg-muted"
            aria-label="Back to classes"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-sm text-muted-foreground">
              Class: {schoolClass.name}
            </p>

            <h2 className="text-xl font-semibold">
              Section Management
            </h2>

            <p className="text-sm text-muted-foreground">
              Manage sections for{" "}
              {schoolClass.name}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          disabled={!schoolClass.isActive}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </button>
      </div>

      {!schoolClass.isActive && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          This class is inactive. Activate the class
          before creating new sections.
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-background p-5"
        >
          <div className="mb-5">
            <h3 className="font-semibold">
              {editingSection
                ? "Edit Section"
                : "Create Section"}
            </h3>

            <p className="text-sm text-muted-foreground">
              Class: {schoolClass.name}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Section Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Section Name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Section A"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Section Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Section Code
              </label>

              <input
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    code: event.target.value,
                  }))
                }
                placeholder="e.g. A"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm uppercase outline-none focus:border-primary"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Capacity
              </label>

              <input
                type="number"
                min={1}
                value={
                  form.capacity ?? ""
                }
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setForm((prev) => ({
                    ...prev,
                    capacity:
                      value === ""
                        ? undefined
                        : Number(value),
                  }));
                }}
                placeholder="e.g. 40"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Room */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Room Number
              </label>

              <input
                value={
                  form.roomNumber ?? ""
                }
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    roomNumber:
                      event.target.value,
                  }))
                }
                placeholder="e.g. 201"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
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

              {editingSection
                ? "Update Section"
                : "Create Section"}
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
            Failed to load sections.
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
        sections.length === 0 && (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border text-center">
            <p className="font-medium">
              No sections found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a section for{" "}
              {schoolClass.name}.
            </p>
          </div>
        )}

      {/* Table */}
      {!isLoading &&
        !isError &&
        sections.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      Section
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Code
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Capacity
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Room
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
                  {sections.map(
                    (section) => (
                      <tr
                        key={section.id}
                        className="hover:bg-muted/30"
                      >
                        <td className="px-5 py-4 font-medium">
                          {section.name}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs">
                          {section.code}
                        </td>

                        <td className="px-5 py-4">
                          {section.capacity ??
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {section.roomNumber ??
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          {
                            section._count
                              ?.enrollments ?? 0
                          }
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                section,
                              )
                            }
                            disabled={
                              toggleMutation.isPending
                            }
                            className={
                              section.isActive
                                ? "rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600"
                                : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                            }
                          >
                            {section.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  section,
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
                                  section,
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

"use client";

import { Package, PackageFeature } from "@/features/super-admin/packages/type";
import { useCreatePackage, useUpdatePackage } from "@/features/super-admin/packages/use-packages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";



const packageFormSchema = z.object({
  name: z.string().min(2, "Package name is required"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative"),
  billingCycle: z.enum([
    "MONTHLY",
    "YEARLY",
    "CUSTOM",
  ]),
  studentLimit: z.coerce
    .number()
    .int("Student limit must be an integer")
    .positive("Student limit must be greater than 0"),
  isActive: z.boolean(),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

interface PackageFormProps {
  packageData?: Package;
}

export function PackageForm({
  packageData,
}: PackageFormProps) {
  const router = useRouter();

  const [features, setFeatures] = useState<PackageFeature[]>(
    packageData?.features
      .filter((item) => item.enabled)
      .map((item) => item.feature) ?? [],
  );

  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  const isEdit = Boolean(packageData);

  const isPending =
    createPackage.isPending ||
    updatePackage.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: packageData?.name ?? "",
      description: packageData?.description ?? "",
      price: Number(packageData?.price ?? 0),
      billingCycle:
        packageData?.billingCycle ?? "MONTHLY",
      studentLimit:
        packageData?.studentLimit ?? 300,
      isActive:
        packageData?.isActive ?? true,
    },
  });

  const onSubmit = async (
    values: PackageFormValues,
  ) => {
    if (features.length === 0) {
      return;
    }

    const featurePayload = features.map((feature) => ({
      feature,
      enabled: true,
    }));

    try {
      if (packageData) {
        await updatePackage.mutateAsync({
          id: packageData.id,
          payload: {
            ...values,
            features: featurePayload,
          },
        });
      } else {
        await createPackage.mutateAsync({
          ...values,
          isCustom: false,
          features: featurePayload,
        });
      }

      router.push("/super-admin/packages");
      router.refresh();
    } catch {
      // Global API error handling can be added here.
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Basic Information */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the package pricing and student limit.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Package Name
            </label>

            <input
              id="name"
              {...register("name")}
              placeholder="e.g. Standard"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary"
            />

            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-medium"
            >
              Price
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              {...register("price")}
              placeholder="0"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary"
            />

            {errors.price && (
              <p className="text-xs text-destructive">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Billing */}
          <div className="space-y-2">
            <label
              htmlFor="billingCycle"
              className="text-sm font-medium"
            >
              Billing Cycle
            </label>

            <select
              id="billingCycle"
              {...register("billingCycle")}
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Student Limit */}
          <div className="space-y-2">
            <label
              htmlFor="studentLimit"
              className="text-sm font-medium"
            >
              Student Limit
            </label>

            <input
              id="studentLimit"
              type="number"
              min="1"
              {...register("studentLimit")}
              placeholder="300"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary"
            />

            {errors.studentLimit && (
              <p className="text-xs text-destructive">
                {errors.studentLimit.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-5 space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            {...register("description")}
            rows={4}
            placeholder="Describe what this package includes..."
            className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary"
          />

          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Active */}
        <label className="mt-5 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            {...register("isActive")}
            className="size-4 rounded border"
          />

          <span className="text-sm font-medium">
            Package is active
          </span>
        </label>
      </div>

      {/* Features */}
      <div className="rounded-2xl border bg-card p-6">
        <PackageFeatureSelector
          value={features}
          onChange={setFeatures}
          disabled={isPending}
        />

        {features.length === 0 && (
          <p className="mt-4 text-xs text-destructive">
            Please select at least one feature.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push("/super-admin/packages")
          }
          disabled={isPending}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending || features.length === 0}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : isEdit
              ? "Update Package"
              : "Create Package"}
        </button>
      </div>
    </form>
  );
}
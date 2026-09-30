"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createSchoolSchema,
  type CreateSchoolFormValues,
} from "@/features/schools/schema";

import type {
  CreateSchoolInput,
  CreateSchoolResponse,
} from "@/features/schools/types";

import { RegistrationFormField } from "./registration-form-field";
import { PublicPackage } from "@/features/public/types";

interface RegistrationFormProps {
  packageId: number;
  selectedPackage: PublicPackage;

  registerSchool: (
    payload: CreateSchoolInput,
  ) => Promise<CreateSchoolResponse>;
}

export function RegistrationForm({
  packageId,
  selectedPackage,
  registerSchool,
}: RegistrationFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreateSchoolFormValues>({
    resolver: zodResolver(createSchoolSchema),

    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      logo: "",

      adminName: "",
      adminEmail: "",
      adminPhone: "",
      adminPassword: "",
      confirmPassword: "",

      packageId,
    },
  });

  const onSubmit = async (
    values: CreateSchoolFormValues,
  ) => {
    try {
      const {
        confirmPassword: _confirmPassword,
        ...schoolData
      } = values;

      const payload: CreateSchoolInput = {
        name: schoolData.name,
        code: schoolData.code,

        email: schoolData.email || undefined,
        phone: schoolData.phone || undefined,
        address: schoolData.address || undefined,
        logo: schoolData.logo || undefined,

        adminName: schoolData.adminName,
        adminEmail: schoolData.adminEmail,
        adminPhone:
          schoolData.adminPhone || undefined,
        adminPassword: schoolData.adminPassword,

        packageId,
      };

      const result = await registerSchool(payload);

      toast.success("Registration submitted", {
        description:
          "Please verify the admin email to continue.",
      });

      sessionStorage.setItem(
        "schoolRegistrationEmail",
        result.admin.email,
      );

      router.push(
        `/auth/verify-email?email=${encodeURIComponent(
          result.admin.email,
        )}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to register school";

      toast.error("Registration failed", {
        description: message,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-6 sm:p-8"
    >
      {/* SCHOOL INFORMATION */}

      <section>
        <div className="mb-5">
          <h2 className="text-base font-semibold">
            School Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter the basic information about your
            school.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* School Name */}

          <RegistrationFormField
            label="School Name"
            htmlFor="name"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.name?.message}
            required
          >
            <input
              id="name"
              type="text"
              placeholder="ABC School & College"
              autoComplete="organization"
              {...register("name")}
              className={inputClass(
                !!errors.name,
              )}
            />
          </RegistrationFormField>

          {/* School Code */}

          <RegistrationFormField
            label="School Code"
            htmlFor="code"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.code?.message}
            required
          >
            <input
              id="code"
              type="text"
              placeholder="ABC001"
              {...register("code")}
              className={inputClass(
                !!errors.code,
              )}
            />
          </RegistrationFormField>

          {/* School Email */}

          <RegistrationFormField
            label="School Email"
            htmlFor="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          >
            <input
              id="email"
              type="email"
              placeholder="school@example.com"
              autoComplete="email"
              {...register("email")}
              className={inputClass(
                !!errors.email,
              )}
            />
          </RegistrationFormField>

          {/* School Phone */}

          <RegistrationFormField
            label="Phone"
            htmlFor="phone"
            icon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
          >
            <input
              id="phone"
              type="tel"
              placeholder="+880 1XXXXXXXXX"
              autoComplete="tel"
              {...register("phone")}
              className={inputClass(
                !!errors.phone,
              )}
            />
          </RegistrationFormField>

          {/* Address */}

          <RegistrationFormField
            label="Address"
            htmlFor="address"
            icon={<MapPin className="h-4 w-4" />}
            error={errors.address?.message}
            className="sm:col-span-2"
          >
            <textarea
              id="address"
              rows={3}
              placeholder="School address"
              {...register("address")}
              className={`${inputClass(
                !!errors.address,
              )} h-auto py-3`}
            />
          </RegistrationFormField>

          {/* Logo */}

          <RegistrationFormField
            label="Logo URL"
            htmlFor="logo"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.logo?.message}
            className="sm:col-span-2"
          >
            <input
              id="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              {...register("logo")}
              className={inputClass(
                !!errors.logo,
              )}
            />
          </RegistrationFormField>
        </div>
      </section>

      {/* ADMIN INFORMATION */}

      <section className="border-t pt-8">
        <div className="mb-5">
          <h2 className="text-base font-semibold">
            Administrator Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            This account will become the school
            administrator after approval.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Admin Name */}

          <RegistrationFormField
            label="Admin Name"
            htmlFor="adminName"
            icon={<User className="h-4 w-4" />}
            error={errors.adminName?.message}
            required
          >
            <input
              id="adminName"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              {...register("adminName")}
              className={inputClass(
                !!errors.adminName,
              )}
            />
          </RegistrationFormField>

          {/* Admin Phone */}

          <RegistrationFormField
            label="Admin Phone"
            htmlFor="adminPhone"
            icon={<Phone className="h-4 w-4" />}
            error={errors.adminPhone?.message}
          >
            <input
              id="adminPhone"
              type="tel"
              placeholder="+880 1XXXXXXXXX"
              autoComplete="tel"
              {...register("adminPhone")}
              className={inputClass(
                !!errors.adminPhone,
              )}
            />
          </RegistrationFormField>

          {/* Admin Email */}

          <RegistrationFormField
            label="Admin Email"
            htmlFor="adminEmail"
            icon={<Mail className="h-4 w-4" />}
            error={errors.adminEmail?.message}
            required
            className="sm:col-span-2"
          >
            <input
              id="adminEmail"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              {...register("adminEmail")}
              className={inputClass(
                !!errors.adminEmail,
              )}
            />
          </RegistrationFormField>

          {/* Password */}

          <RegistrationFormField
            label="Password"
            htmlFor="adminPassword"
            icon={<LockKeyhole className="h-4 w-4" />}
            error={errors.adminPassword?.message}
            required
          >
            <div className="relative">
              <input
                id="adminPassword"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                {...register("adminPassword")}
                className={`${inputClass(
                  !!errors.adminPassword,
                )} pr-10`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </RegistrationFormField>

          {/* Confirm Password */}

          <RegistrationFormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            icon={<LockKeyhole className="h-4 w-4" />}
            error={
              errors.confirmPassword?.message
            }
            required
          >
            <div className="relative">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                className={`${inputClass(
                  !!errors.confirmPassword,
                )} pr-10`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </RegistrationFormField>
        </div>
      </section>

      {/* SUBMIT */}

      <div className="border-t pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {isSubmitting
            ? "Submitting registration..."
            : `Register with ${selectedPackage.name}`}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          After registration, you'll need to verify
          the admin email before your school can be
          reviewed.
        </p>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    hasError ? "border-destructive" : ""
  }`;
}
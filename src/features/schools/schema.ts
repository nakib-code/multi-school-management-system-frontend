import { z } from "zod";

export const createSchoolSchema = z
  .object({
    name: z
      .string()
      .min(2, "School name must be at least 2 characters")
      .max(150, "School name is too long"),

    code: z
      .string()
      .min(2, "School code must be at least 2 characters")
      .max(30, "School code is too long"),

    email: z
      .string()
      .email("Please provide a valid school email")
      .optional()
      .or(z.literal("")),

    phone: z.string().optional(),

    address: z.string().optional(),

    logo: z
      .string()
      .url("Logo must be a valid URL")
      .optional()
      .or(z.literal("")),

    adminName: z
      .string()
      .min(2, "Admin name must be at least 2 characters")
      .max(100, "Admin name is too long"),

    adminEmail: z
      .string()
      .email("Please provide a valid admin email"),

    adminPhone: z.string().optional(),

    adminPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.adminPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export type CreateSchoolFormValues = z.infer<
  typeof createSchoolSchema
>;

/**
 * Verify Admin Email
 */
export const verifyAdminEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  code: z
    .string()
    .trim()
    .length(6, "Verification code must be 6 digits")
    .regex(
      /^\d{6}$/,
      "Verification code must contain only numbers",
    ),
});

export type VerifyEmailAdminFormValues = z.infer<
  typeof verifyAdminEmailSchema
>;

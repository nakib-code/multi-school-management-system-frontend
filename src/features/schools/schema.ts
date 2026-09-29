import { z } from "zod";

export const createSchoolSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "School name must be at least 2 characters")
      .max(150, "School name is too long"),

    code: z
      .string()
      .trim()
      .min(2, "School code must be at least 2 characters")
      .max(30, "School code is too long"),

    email: z
      .string()
      .trim()
      .email("Please provide a valid school email")
      .optional()
      .or(z.literal("")),

    phone: z.string().trim().optional(),

    address: z.string().trim().optional(),

    logo: z
      .string()
      .trim()
      .url("Logo must be a valid URL")
      .optional()
      .or(z.literal("")),

    adminName: z
      .string()
      .trim()
      .min(2, "Admin name must be at least 2 characters")
      .max(100, "Admin name is too long"),

    adminEmail: z
      .string()
      .trim()
      .email("Please provide a valid admin email")
      .transform((value) => value.toLowerCase()),

    adminPhone: z.string().trim().optional(),

    adminPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
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

export const verifyAdminEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase()),

  code: z
    .string()
    .trim()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only digits"),
});

export type VerifyAdminEmailFormValues = z.infer<
  typeof verifyAdminEmailSchema
>;
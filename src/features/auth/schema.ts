import { z } from "zod";

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isValidPhone = (val: string) => {
  const digits = val.replace(/[\s\-().+]/g, "");
  return /^\d{6,15}$/.test(digits);
};

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Phone number or email is required")
    .refine(
      (value) => isValidEmail(value) || isValidPhone(value),
      "Enter a valid phone number (e.g. 01XXXXXXXXX) or email address",
    )
    .transform((value) =>
      value.includes("@")
        ? value.toLowerCase()
        : value.replace(/[\s\-()]/g, ""),
    ),

  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

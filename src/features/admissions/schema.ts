import { z } from "zod";

export const admissionSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(150),

  studentEmail: z
    .string()
    .trim()
    .email("Please enter a valid student email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),

  dateOfBirth: z.string().optional(),

  gender: z.string().optional(),

  bloodGroup: z.string().optional(),

  previousSchool: z.string().optional(),

  previousClass: z.string().optional(),

  guardianName: z.string().optional(),

  guardianEmail: z
    .string()
    .email("Please enter a valid guardian email")
    .optional()
    .or(z.literal("")),

  guardianPhone: z.string().optional(),

  guardianRelationship: z.string().optional(),

  guardianNid: z.string().optional(),

  guardianOccupation: z.string().optional(),

  address: z.string().max(500).optional(),

  classId: z.coerce
    .number()
    .int()
    .positive("Please select a class"),

  sectionId: z.coerce
    .number()
    .int()
    .positive("Please select a section"),

  academicYear: z
    .string()
    .trim()
    .min(4, "Academic year is required")
    .max(20),

  shift: z.string().optional(),

  group: z.string().optional(),

  studentPhotoUrl: z
    .string()
    .url("Please enter a valid photo URL")
    .optional()
    .or(z.literal("")),

  birthCertificateUrl: z
    .string()
    .url("Please enter a valid document URL")
    .optional()
    .or(z.literal("")),

  previousCertificateUrl: z
    .string()
    .url("Please enter a valid document URL")
    .optional()
    .or(z.literal("")),

  paymentMethod: z.enum(["CASH", "ONLINE"]),
});

export type AdmissionFormValues = z.infer<typeof admissionSchema>;
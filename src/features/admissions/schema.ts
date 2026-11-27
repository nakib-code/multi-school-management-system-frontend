import { z } from "zod";

const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

export const admissionSchema = z.object({
  // Stage 1 — Required Student Info
  studentName: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(150),

  dateOfBirth: z.string().trim().min(4, "Date of birth is required"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select gender",
  }),

  residentialType: z
    .enum(["NON_RESIDENTIAL", "RESIDENTIAL", "DAY_CARE"])
    .default("NON_RESIDENTIAL"),

  // Stage 1 — Required Academic Info
  academicYear: z.string().trim().min(4, "Academic year is required").max(20),

  classId: z.coerce.number().int().positive("Please select a class"),

  sectionId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),

  shift: z.enum(["MORNING", "DAY", "EVENING"]).default("MORNING"),

  academicGroup: z.preprocess(
    emptyToUndefined,
    z.enum(["SCIENCE", "ARTS", "COMMERCE"]).optional(),
  ),

  quranWing: z.preprocess(
    emptyToUndefined,
    z.enum(["NOORANI", "QAIDA", "AMPARA", "NAJERA", "HEFZ"]).optional(),
  ),

  // Stage 1 — Required Guardian Info
  guardianName: z.string().trim().min(2, "Guardian name is required").max(150),

  guardianPhone: z
    .string()
    .trim()
    .min(6, "Guardian phone number is required")
    .max(30),

  guardianRelationship: z.string().trim().max(50).optional().default("FATHER"),

  guardianEmail: z.preprocess(
    emptyToUndefined,
    z.string().trim().email("Please enter a valid guardian email").optional(),
  ),

  guardianNid: z.string().trim().max(50).optional(),
  guardianOccupation: z.string().trim().max(100).optional(),

  // Stage 2 — Optional Details
  nameBangla: z.string().trim().max(150).optional(),
  birthRegNo: z.string().trim().max(30).optional(),
  bloodGroup: z.string().trim().max(10).optional(),
  previousSchool: z.string().trim().max(200).optional(),
  previousClass: z.string().trim().max(100).optional(),
  fatherName: z.string().trim().max(150).optional(),
  motherName: z.string().trim().max(150).optional(),
  presentAddress: z.string().trim().max(500).optional(),
  permanentAddress: z.string().trim().max(500).optional(),

  // Optional Documents
  studentPhotoUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("Please enter a valid photo URL").optional(),
  ),
  birthCertificateUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("Please enter a valid document URL").optional(),
  ),
  guardianNidUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("Please enter a valid document URL").optional(),
  ),
  previousTcUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("Please enter a valid document URL").optional(),
  ),

  // Optional Payment
  paymentMethod: z
    .enum(["CASH", "ONLINE", "BKASH", "NAGAD", "ROCKET"])
    .optional(),
});

export type AdmissionFormValues = z.infer<typeof admissionSchema>;

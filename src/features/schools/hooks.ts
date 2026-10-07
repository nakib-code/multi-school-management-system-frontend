"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  approveSchool,
  blockSchool,
  createSchool,
  deleteSchool,
  getPublicSchoolById,
  getPublicSchools,
  GetPublicSchoolsParams,
  getSchools,
  rejectSchool,
  unblockSchool,
  verifyAdminEmail,
  type GetSchoolsParams,
} from "./api";

import type {
  CreateSchoolInput,
  RejectSchoolPayload,
  VerifyAdminEmailPayload,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                               School Queries                               */
/* -------------------------------------------------------------------------- */

export const useSchools = (params: GetSchoolsParams = {}) => {
  return useQuery({
    queryKey: ["schools", "list", params],
    queryFn: () => getSchools(params),
  });
};

/* -------------------------------------------------------------------------- */
/*                              Public Registration                           */
/* -------------------------------------------------------------------------- */

export const useCreateSchool = () => {
  return useMutation({
    mutationFn: (payload: CreateSchoolInput) => createSchool(payload),
  });
};

export const useVerifyAdminEmail = () => {
  return useMutation({
    mutationFn: (payload: VerifyAdminEmailPayload) =>
      verifyAdminEmail(payload),
  });
};

/* -------------------------------------------------------------------------- */
/*                            Super Admin Mutations                           */
/* -------------------------------------------------------------------------- */

export const useApproveSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schools", "list"],
      });
    },
  });
};

export const useRejectSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: RejectSchoolPayload;
    }) => rejectSchool(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schools", "list"],
      });
    },
  });
};

export const useBlockSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => blockSchool(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schools", "list"],
      });
    },
  });
};

export const useUnblockSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unblockSchool(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schools", "list"],
      });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSchool(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["schools", "list"],
      });
    },
  });
};


// ============================================
// Public - School Details
// ============================================

export const useSchool = (schoolId: number) => {
  return useQuery({
    queryKey: ["schools", "public", schoolId],
    queryFn: () => getPublicSchoolById(schoolId),
    enabled: Number.isInteger(schoolId) && schoolId > 0,
  });
};

// ============================================
// Public - School List
// ============================================

export const usePublicSchools = (
  params: GetPublicSchoolsParams = {},
) => {
  return useQuery({
    queryKey: ["schools", "public", params],
    queryFn: () => getPublicSchools(params),
    placeholderData: (previousData) => previousData,
  });
};
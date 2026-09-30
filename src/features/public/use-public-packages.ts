"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicPackages } from "./api";

export const publicPackageKeys = {
  all: ["public-packages"] as const,
};

export const usePublicPackages = () => {
  return useQuery({
    queryKey: publicPackageKeys.all,
    queryFn: getPublicPackages,
    staleTime: 5 * 60 * 1000,
  });
};
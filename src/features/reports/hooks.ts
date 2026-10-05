import { useQuery } from "@tanstack/react-query";

import { getReportOverview } from "./api";

export const reportKeys = {
  all: ["reports"] as const,
  overview: () => [...reportKeys.all, "overview"] as const,
};

export const useReportOverview = () => {
  return useQuery({
    queryKey: reportKeys.overview(),
    queryFn: getReportOverview,
  });
};

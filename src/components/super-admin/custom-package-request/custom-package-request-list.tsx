"use client";

import Link from "next/link";
import {
  ClipboardList,
  Loader2,
  Eye,
} from "lucide-react";
import { useCustomPackageRequests } from "@/features/super-admin/custom-package-requests/use-custom-package-requests";


const getStatusClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-600";

    case "APPROVED":
      return "bg-green-500/10 text-green-600";

    case "REJECTED":
      return "bg-red-500/10 text-red-600";

    case "CANCELLED":
      return "bg-muted text-muted-foreground";

    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export default function CustomPackageRequestList() {
  const {
    data,
    isLoading,
    isError,
  } = useCustomPackageRequests();

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <ClipboardList className="mx-auto mb-3 size-10 text-destructive" />

        <h3 className="font-semibold">
          Failed to load requests
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Please try again later.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <ClipboardList className="mx-auto mb-3 size-10 text-muted-foreground" />

        <h3 className="font-semibold">
          No custom package requests
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Custom package requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="size-5 text-primary" />
        </div>

        <div>
          <h2 className="font-semibold">
            Custom Package Requests
          </h2>

          <p className="text-sm text-muted-foreground">
            Review custom package requests from schools.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-5 py-3 font-medium">
                School
              </th>

              <th className="px-5 py-3 font-medium">
                Student Limit
              </th>

              <th className="px-5 py-3 font-medium">
                Requested Price
              </th>

              <th className="px-5 py-3 font-medium">
                Billing
              </th>

              <th className="px-5 py-3 font-medium">
                Features
              </th>

              <th className="px-5 py-3 font-medium">
                Status
              </th>

              <th className="px-5 py-3 font-medium">
                Requested
              </th>

              <th className="px-5 py-3 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((request) => (
              <tr
                key={request.id}
                className="border-b last:border-0"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium">
                      {request.school.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {request.school.code}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  {request.requestedStudentLimit.toLocaleString()}
                </td>

                <td className="px-5 py-4">
                  {request.requestedPrice}
                </td>

                <td className="px-5 py-4">
                  {request.billingCycle}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs">
                    {request.features.length} features
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      request.status,
                    )}`}
                  >
                    {request.status}
                  </span>
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  {formatDate(request.createdAt)}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/dashboard/super-admin/custom-package-requests/${request.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Eye className="size-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
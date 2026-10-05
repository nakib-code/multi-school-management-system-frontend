import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CustomPackageRequestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomPackageRequestDetailsPage({
  params,
}: CustomPackageRequestDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/super-admin/custom-package-requests"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
          aria-label="Back to custom package requests"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Custom Package Request
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Request ID: {id}
          </p>
        </div>
      </div>
    </div>
  );
}

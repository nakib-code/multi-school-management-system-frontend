import { PackageList } from "@/components/super-admin/package/package-list";
import Link from "next/link";


export default function PackagesPage() {
  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Packages
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage subscription packages and their features.
          </p>
        </div>

        <Link
          href="/super-admin/packages/create"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          + Create Package
        </Link>
      </div>

      {/* Package List */}
      <PackageList />
    </main>
  );
}
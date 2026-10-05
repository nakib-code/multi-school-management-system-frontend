import { PackageForm } from "@/components/super-admin/package/package-form";
import Link from "next/link";


export default function CreatePackagePage() {
  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Link
          href="/super-admin/packages"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Packages
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Create Package
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a new subscription package for schools.
          </p>
        </div>
      </div>

      {/* Form */}
      <PackageForm />
    </main>
  );
}
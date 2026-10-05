import CustomPackageRequestList from "@/components/super-admin/custom-package-request/custom-package-request-list";

export default function CustomPackageRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Custom Package Requests
        </h1>

        <p className="text-sm text-muted-foreground">
          Review and manage custom package requests submitted by schools.
        </p>
      </div>

      <CustomPackageRequestList />
    </div>
  );
}

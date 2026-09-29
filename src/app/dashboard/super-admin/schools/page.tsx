import { SchoolTable } from "@/components/super-admin/schools/school-table";
import { PageHeader } from "@/components/shared/page-header";

export default function SuperAdminSchoolsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Manage school registrations, approvals, and school status."
      />

      <SchoolTable />
    </div>
  );
}
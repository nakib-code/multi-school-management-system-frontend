import { PageHeader } from "@/components/shared/page-header";
import { UsersView } from "@/components/super-admin/users/users-view";

export default function SuperAdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="View and manage users across all schools."
      />

      <UsersView />
    </div>
  );
}
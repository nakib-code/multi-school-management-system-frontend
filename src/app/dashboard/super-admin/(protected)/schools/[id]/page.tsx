import { SchoolUserDetailsPageContent } from "@/components/super-admin/users/school-user-details-page-content";

export default async function SchoolUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const schoolId = Number(id);

  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">
          Invalid school ID.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SchoolUserDetailsPageContent schoolId={schoolId} />
    </div>
  );
}

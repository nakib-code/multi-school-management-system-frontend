import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your student portal.
        </p>
      </div>

      <Link
        href="/dashboard/student/profile"
        className="flex max-w-md items-center gap-4 rounded-2xl border bg-background p-6 transition hover:bg-muted/40"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <h2 className="font-semibold">My Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View your personal and contact information.
          </p>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </div>
  );
}
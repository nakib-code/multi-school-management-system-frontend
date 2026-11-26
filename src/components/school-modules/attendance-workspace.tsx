"use client";

import { useMemo, useState } from "react";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import { useLeaveRequests } from "@/features/attendance/hooks";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { useAuth } from "@/providers/auth-provider";
import { AttendanceLogsTab } from "./attendance/attendance-logs-tab";
import { AttendanceReportsTab } from "./attendance/attendance-reports-tab";
import { AttendanceSettingsTab } from "./attendance/attendance-settings-tab";
import { GuardianAttendanceView } from "./attendance/guardian-attendance-view";
import { LeaveRequestsTab } from "./attendance/leave-requests-tab";
import { TakeAttendanceTab } from "./attendance/take-attendance-tab";

type StaffTab = "take" | "logs" | "leaves" | "reports" | "settings";

export function AttendanceWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const role = user?.role ?? "";

  const isTeacher = role === "TEACHER";
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
  const canMark = isAdminOrManager || isTeacher;
  const isGuardian = role === "GUARDIAN";

  const [tab, setTab] = useState<StaffTab>("take");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const { data: allClasses = [] } = useClasses(canMark ? schoolId : 0);
  const { data: allSections = [] } = useSections(canMark ? schoolId : 0);
  const { data: teacherAssignments = [] } = useTeacherAssignments(
    isTeacher ? schoolId : 0,
  );
  const pendingLeavesQuery = useLeaveRequests(
    schoolId,
    { status: "PENDING" },
    { enabled: canMark && schoolId > 0 },
  );

  const availableClasses = useMemo(() => {
    if (!isTeacher) return allClasses;
    const assigned = new Set(teacherAssignments.map((a) => a.classId));
    return allClasses.filter((c) => assigned.has(c.id));
  }, [isTeacher, allClasses, teacherAssignments]);

  const availableSections = useMemo(() => {
    const cid = Number(selectedClassId);
    if (!cid) return [];
    const byClass = allSections.filter((s) => s.classId === cid);
    if (!isTeacher) return byClass;
    const assigned = new Set(
      teacherAssignments
        .filter((a) => a.classId === cid)
        .map((a) => a.sectionId),
    );
    return byClass.filter((s) => assigned.has(s.id));
  }, [isTeacher, allSections, selectedClassId, teacherAssignments]);

  const pendingLeaveCount = pendingLeavesQuery.data?.length ?? 0;

  const staffTabs: Array<{ id: StaffTab; label: string; badge?: number }> = [
    { id: "take", label: "Take Attendance" },
    { id: "logs", label: "Logs" },
    {
      id: "leaves",
      label: "Leave Requests",
      ...(pendingLeaveCount > 0 ? { badge: pendingLeaveCount } : {}),
    },
    ...(isAdminOrManager
      ? [
          { id: "reports" as const, label: "Reports" },
          { id: "settings" as const, label: "Settings" },
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      <div className="no-print">
        <h1 className="text-2xl font-bold tracking-tight">
          {canMark ? "Attendance" : "Attendance Sheet"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canMark
            ? "Mark daily attendance, review leave requests, and publish monthly reports. Guardians receive alerts only on absences, late arrivals, or excused changes."
            : "Monthly attendance calendar, attendance rate, leave requests, and published reports."}
        </p>
      </div>

      {!canMark ? (
        <GuardianAttendanceView schoolId={schoolId} isGuardian={isGuardian} />
      ) : (
        <>
          {/* Staff Navigation Tabs */}
          <div className="no-scrollbar no-print flex gap-1.5 overflow-x-auto border-b">
            {staffTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2 text-sm font-medium transition ${
                  tab === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "take" && (
            <TakeAttendanceTab
              schoolId={schoolId}
              isTeacher={isTeacher}
              classes={availableClasses}
              sections={availableSections}
              selectedClassId={selectedClassId}
              selectedSectionId={selectedSectionId}
              onClassChange={(cid) => {
                setSelectedClassId(cid);
                setSelectedSectionId("");
              }}
              onSectionChange={setSelectedSectionId}
            />
          )}

          {tab === "logs" && (
            <AttendanceLogsTab
              schoolId={schoolId}
              isTeacher={isTeacher}
              canDelete={isAdminOrManager}
              classes={availableClasses}
              sections={availableSections}
              selectedClassId={selectedClassId}
              selectedSectionId={selectedSectionId}
              onClassChange={(cid) => {
                setSelectedClassId(cid);
                setSelectedSectionId("");
              }}
              onSectionChange={setSelectedSectionId}
            />
          )}

          {tab === "leaves" && <LeaveRequestsTab schoolId={schoolId} />}

          {tab === "reports" && isAdminOrManager && (
            <AttendanceReportsTab
              schoolId={schoolId}
              classes={allClasses}
              allSections={allSections}
            />
          )}

          {tab === "settings" && isAdminOrManager && (
            <AttendanceSettingsTab schoolId={schoolId} />
          )}
        </>
      )}
    </div>
  );
}

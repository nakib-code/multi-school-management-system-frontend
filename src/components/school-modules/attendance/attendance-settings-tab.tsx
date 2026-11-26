"use client";

import { CalendarDays, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAttendanceSettings,
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
  useUpdateAttendanceSettings,
} from "@/features/attendance/hooks";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatLocalDateDisplay,
  getSchoolTodayStr,
  WEEKDAY_NAMES,
} from "@/lib/attendance-date";

export function AttendanceSettingsTab({ schoolId }: { schoolId: number }) {
  const settingsQuery = useAttendanceSettings(schoolId);
  const holidaysQuery = useHolidays(schoolId);

  const updateSettingsMut = useUpdateAttendanceSettings(schoolId);
  const createHolidayMut = useCreateHoliday(schoolId);
  const deleteHolidayMut = useDeleteHoliday(schoolId);

  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([5]);
  const [holidayDate, setHolidayDate] = useState(() => getSchoolTodayStr());
  const [holidayTitle, setHolidayTitle] = useState("");

  useEffect(() => {
    if (settingsQuery.data) {
      setWeeklyOffDays(settingsQuery.data.weeklyOffDays);
    }
  }, [settingsQuery.data]);

  const toggleDay = (dayValue: number) => {
    setWeeklyOffDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((d) => d !== dayValue);
      }
      if (prev.length >= 6) {
        toast.error("At least one working day is required");
        return prev;
      }
      return [...prev, dayValue].sort((a, b) => a - b);
    });
  };

  const handleSaveWeeklyOff = async () => {
    await updateSettingsMut.mutateAsync(weeklyOffDays);
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayTitle.trim()) return;
    await createHolidayMut.mutateAsync({
      date: holidayDate,
      title: holidayTitle.trim(),
    });
    setHolidayTitle("");
  };

  if (settingsQuery.isLoading || holidaysQuery.isLoading) {
    return <LoadingState message="Loading attendance settings..." />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          settingsQuery.error,
          "Failed to load settings",
        )}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  const holidays = holidaysQuery.data ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Weekly-Off Days */}
      <div className="surface-panel space-y-4 p-4 sm:p-5">
        <div>
          <h3 className="text-base font-semibold">Weekly-Off Days</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Attendance cannot be marked on weekly-off days and they are excluded
            from working day calculations. Default is Friday.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WEEKDAY_NAMES.map((day) => {
            const isOff = weeklyOffDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`min-h-[44px] rounded-[11px] border px-3 py-2 text-xs font-semibold transition ${
                  isOff
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSaveWeeklyOff}
            disabled={updateSettingsMut.isPending}
            className="min-h-[42px] gap-1.5 rounded-[11px] sm:min-h-0"
          >
            <Save className="h-3.5 w-3.5" />
            {updateSettingsMut.isPending ? "Saving..." : "Save Weekly-Off Days"}
          </Button>
        </div>
      </div>

      {/* School Holidays */}
      <div className="surface-panel space-y-4 p-4 sm:p-5">
        <div>
          <h3 className="text-base font-semibold">School Holidays</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add national, religious, or school-specific holidays. Holidays are
            blocked for attendance and shown in guardian calendars.
          </p>
        </div>

        <form
          onSubmit={handleAddHoliday}
          className="grid gap-2.5 sm:grid-cols-12"
        >
          <div className="space-y-1 sm:col-span-4">
            <Label htmlFor="holiday-date" className="text-xs">
              Date
            </Label>
            <Input
              id="holiday-date"
              type="date"
              required
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="h-10 rounded-[11px] sm:h-9"
            />
          </div>
          <div className="space-y-1 sm:col-span-5">
            <Label htmlFor="holiday-title" className="text-xs">
              Holiday Title
            </Label>
            <Input
              id="holiday-title"
              required
              value={holidayTitle}
              onChange={(e) => setHolidayTitle(e.target.value)}
              placeholder="e.g. Eid-ul-Fitr"
              className="h-10 rounded-[11px] sm:h-9"
            />
          </div>
          <div className="flex items-end sm:col-span-3">
            <Button
              type="submit"
              size="sm"
              disabled={createHolidayMut.isPending}
              className="min-h-[40px] w-full gap-1 rounded-[11px] sm:min-h-[36px]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </form>

        {holidays.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No holidays added yet"
            description="Add upcoming school holidays above."
          />
        ) : (
          <div className="divide-y rounded-[11px] border">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{h.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatLocalDateDisplay(h.date)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={deleteHolidayMut.isPending}
                  onClick={() => deleteHolidayMut.mutate(h.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

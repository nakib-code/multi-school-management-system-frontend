"use client";

import { Save, Settings, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdmissionFee,
  useUpdateAdmissionFee,
} from "@/features/admin/settings/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function SchoolSettingsView() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const { data: setting, isLoading } = useAdmissionFee(schoolId);
  const updateMutation = useUpdateAdmissionFee(schoolId);

  const [admissionFee, setAdmissionFee] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [rocketNumber, setRocketNumber] = useState("");

  useEffect(() => {
    if (setting) {
      setAdmissionFee(String(setting.admissionFee ?? ""));
      setBkashNumber(setting.bkashNumber ?? "");
      setNagadNumber(setting.nagadNumber ?? "");
      setRocketNumber(setting.rocketNumber ?? "");
    }
  }, [setting]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(admissionFee);
    if (!Number.isFinite(fee) || fee <= 0) {
      toast.error("Please enter a valid admission fee greater than 0");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        admissionFee: fee,
        bkashNumber: bkashNumber.trim() || null,
        nagadNumber: nagadNumber.trim() || null,
        rocketNumber: rocketNumber.trim() || null,
      });
      toast.success("Institution fee & mobile banking settings saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update settings"));
    }
  };

  if (isLoading) return <LoadingState message="Loading settings..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Institution Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your admission fee and bKash, Nagad, and Rocket receiver numbers for student payments.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 border-b pb-3">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Fee &amp; Payment Receiver Settings</h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admissionFee">Admission Fee (BDT)</Label>
          <Input
            id="admissionFee"
            type="number"
            min={1}
            step="0.01"
            required
            value={admissionFee}
            onChange={(e) => setAdmissionFee(e.target.value)}
            placeholder="e.g. 1500"
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4 text-primary" />
            Manual Mobile Banking Receiver Numbers (Bangladesh)
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="bkashNumber">bKash Number</Label>
              <Input
                id="bkashNumber"
                placeholder="01XXXXXXXXX"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nagadNumber">Nagad Number</Label>
              <Input
                id="nagadNumber"
                placeholder="01XXXXXXXXX"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rocketNumber">Rocket Number</Label>
              <Input
                id="rocketNumber"
                placeholder="01XXXXXXXXX"
                value={rocketNumber}
                onChange={(e) => setRocketNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>

      <div className="rounded-xl border bg-card p-6">
        <FileUpload
          category="SCHOOL_LOGO"
          label="Institution Logo"
          accept="image/jpeg,image/png,image/webp"
          maxSizeMb={5}
        />
      </div>
    </div>
  );
}

export default SchoolSettingsView;

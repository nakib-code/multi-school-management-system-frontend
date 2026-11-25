"use client";

import { Save, Settings, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdmissionFee,
  useUpdateAdmissionFee,
} from "@/features/admin/settings/hooks";
import type { MobileAccountType } from "@/features/payments/types";
import {
  useSchoolPaymentMethods,
  useUpdateSchoolPaymentMethods,
} from "@/features/school-settings/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const ACCOUNT_TYPES: MobileAccountType[] = ["PERSONAL", "MERCHANT", "AGENT"];

export function SchoolSettingsView() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const [activeTab, setActiveTab] = useState<"general" | "payments">(
    "payments",
  );

  const { data: setting, isLoading } = useAdmissionFee(schoolId);
  const { data: paymentMethods, isLoading: pmLoading } =
    useSchoolPaymentMethods(schoolId > 0 ? schoolId : undefined);
  const updateFeeMutation = useUpdateAdmissionFee(schoolId);
  const updatePaymentsMutation = useUpdateSchoolPaymentMethods(schoolId);

  const [admissionFee, setAdmissionFee] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashType, setBkashType] = useState<MobileAccountType>("PERSONAL");
  const [nagadNumber, setNagadNumber] = useState("");
  const [nagadType, setNagadType] = useState<MobileAccountType>("PERSONAL");
  const [rocketNumber, setRocketNumber] = useState("");
  const [rocketType, setRocketType] = useState<MobileAccountType>("PERSONAL");
  const [feePaymentInstruction, setFeePaymentInstruction] = useState("");

  useEffect(() => {
    if (setting) {
      setAdmissionFee(String(setting.admissionFee ?? ""));
    }
  }, [setting]);

  useEffect(() => {
    if (paymentMethods) {
      setBkashNumber(paymentMethods.bkashNumber ?? "");
      setBkashType(paymentMethods.bkashType ?? "PERSONAL");
      setNagadNumber(paymentMethods.nagadNumber ?? "");
      setNagadType(paymentMethods.nagadType ?? "PERSONAL");
      setRocketNumber(paymentMethods.rocketNumber ?? "");
      setRocketType(paymentMethods.rocketType ?? "PERSONAL");
      setFeePaymentInstruction(paymentMethods.feePaymentInstruction ?? "");
    }
  }, [paymentMethods]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(admissionFee);
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error("Please enter a valid admission fee");
      return;
    }
    try {
      await updateFeeMutation.mutateAsync({
        admissionFee: fee,
      });
      toast.success("General admission fee settings saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update settings"));
    }
  };

  const handleSavePaymentMethods = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePaymentsMutation.mutateAsync({
      bkashNumber: bkashNumber.trim() || null,
      bkashType,
      nagadNumber: nagadNumber.trim() || null,
      nagadType,
      rocketNumber: rocketNumber.trim() || null,
      rocketType,
      feePaymentInstruction: feePaymentInstruction.trim() || null,
    });
  };

  if (isLoading || pmLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Institution Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your institution&apos;s mobile banking accounts for guardian
          fee payments, admission fees, and branding.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "payments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Payment Methods
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          General &amp; Branding
        </button>
      </div>

      {activeTab === "payments" ? (
        <form
          onSubmit={handleSavePaymentMethods}
          className="space-y-6 rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 border-b pb-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">
                School Mobile Banking Accounts (Guardian Fee Payments)
              </h2>
              <p className="text-xs text-muted-foreground">
                These numbers are shown to guardians when they pay student fees
                online.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="bkashType">bKash Account Type</Label>
                <select
                  id="bkashType"
                  value={bkashType}
                  onChange={(e) =>
                    setBkashType(e.target.value as MobileAccountType)
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="nagadType">Nagad Account Type</Label>
                <select
                  id="nagadType"
                  value={nagadType}
                  onChange={(e) =>
                    setNagadType(e.target.value as MobileAccountType)
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="rocketNumber">Rocket Number</Label>
                <Input
                  id="rocketNumber"
                  placeholder="01XXXXXXXXXX"
                  value={rocketNumber}
                  onChange={(e) => setRocketNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rocketType">Rocket Account Type</Label>
                <select
                  id="rocketType"
                  value={rocketType}
                  onChange={(e) =>
                    setRocketType(e.target.value as MobileAccountType)
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 border-t pt-4">
              <Label htmlFor="feePaymentInstruction">
                Fee Payment Instructions (Optional)
              </Label>
              <Textarea
                id="feePaymentInstruction"
                rows={3}
                placeholder="e.g. Send Money to our bKash Personal number and write the student's name in reference."
                value={feePaymentInstruction}
                onChange={(e) => setFeePaymentInstruction(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updatePaymentsMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {updatePaymentsMutation.isPending
              ? "Saving..."
              : "Save Payment Methods"}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveGeneral}
            className="space-y-6 rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 border-b pb-3">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Admission Fee Configuration</h2>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admissionFee">Admission Fee (BDT)</Label>
              <Input
                id="admissionFee"
                type="number"
                min={0}
                step="0.01"
                required
                value={admissionFee}
                onChange={(e) => setAdmissionFee(e.target.value)}
                placeholder="e.g. 1500"
              />
            </div>

            <Button
              type="submit"
              disabled={updateFeeMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateFeeMutation.isPending
                ? "Saving..."
                : "Save General Settings"}
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
      )}
    </div>
  );
}

export default SchoolSettingsView;

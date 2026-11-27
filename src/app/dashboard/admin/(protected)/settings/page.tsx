"use client";

import {
  Building2,
  Globe,
  Save,
  Settings,
  Smartphone,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalWebsiteSettings } from "@/components/school-modules/external-website-settings";
import { FileUpload } from "@/components/shared/file-upload";
import { LoadingState } from "@/components/shared/loading";
import { SelfProfileForm } from "@/components/shared/self-profile-form";
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
  useSchoolProfile,
  useUpdateSchoolPaymentMethods,
  useUpdateSchoolProfile,
} from "@/features/school-settings/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const ACCOUNT_TYPES: MobileAccountType[] = ["PERSONAL", "MERCHANT", "AGENT"];

export function SchoolSettingsView() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<
    "general" | "payments" | "website" | "profile"
  >("payments");

  const { data: setting, isLoading } = useAdmissionFee(schoolId);
  const { data: paymentMethods, isLoading: pmLoading } =
    useSchoolPaymentMethods(schoolId > 0 ? schoolId : undefined);
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const updateFeeMutation = useUpdateAdmissionFee(schoolId);
  const updatePaymentsMutation = useUpdateSchoolPaymentMethods(schoolId);
  const updateProfileMutation = useUpdateSchoolProfile(schoolId);

  const [admissionFee, setAdmissionFee] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
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
    if (schoolProfile) {
      setSchoolName(schoolProfile.name ?? "");
      setSchoolPhone(schoolProfile.phone ?? "");
      setSchoolEmail(schoolProfile.email ?? "");
      setSchoolAddress(schoolProfile.address ?? "");
    }
  }, [schoolProfile]);

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

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = schoolName.trim();
    if (trimmedName.length < 2) {
      toast.error("Institution name must be at least 2 characters");
      return;
    }
    await updateProfileMutation.mutateAsync({
      name: trimmedName,
      phone: schoolPhone.trim() || null,
      email: schoolEmail.trim() || null,
      address: schoolAddress.trim() || null,
    });
  };

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

        <button
          type="button"
          onClick={() => setActiveTab("website")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "website"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4" />
          External Website
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          My Profile
        </button>
      </div>

      {activeTab === "website" ? (
        <ExternalWebsiteSettings schoolId={schoolId} isAdmin={isAdmin} />
      ) : activeTab === "profile" ? (
        <SelfProfileForm />
      ) : activeTab === "payments" ? (
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
                {isAdmin
                  ? "These numbers are shown to guardians when they pay student fees online."
                  : "View-only for Managers. Only the School Admin can update payout numbers."}
              </p>
            </div>
          </div>

          <fieldset
            disabled={!isAdmin}
            className="space-y-4 disabled:opacity-75"
          >
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
          </fieldset>

          {isAdmin && (
            <Button
              type="submit"
              disabled={updatePaymentsMutation.isPending}
              className="min-h-[44px] gap-2 rounded-[11px] sm:min-h-0"
            >
              <Save className="h-4 w-4" />
              {updatePaymentsMutation.isPending
                ? "Saving..."
                : "Save Payment Methods"}
            </Button>
          )}
        </form>
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveSchoolProfile}
            className="space-y-5 rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 border-b pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">
                  Institution Profile &amp; Contact Info
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAdmin
                    ? "Your institution name, logo, and contact details automatically sync to your connected landing website."
                    : "View-only for Managers. Only the School Admin can update institution profile details."}
                </p>
              </div>
            </div>

            <fieldset
              disabled={!isAdmin}
              className="space-y-4 disabled:opacity-75"
            >
              <div className="space-y-1.5">
                <Label htmlFor="schoolName">Institution Name</Label>
                <Input
                  id="schoolName"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Darul Uloom Madrasa"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="schoolPhone">Contact Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={schoolPhone}
                    onChange={(e) => setSchoolPhone(e.target.value)}
                    placeholder="e.g. 01XXXXXXXXX"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="schoolEmail">Contact Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                    placeholder="e.g. info@madrasa.edu.bd"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schoolAddress">Institution Address</Label>
                <Textarea
                  id="schoolAddress"
                  rows={2}
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  placeholder="Full campus address"
                />
              </div>
            </fieldset>

            {isAdmin && (
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="min-h-[44px] gap-2 rounded-[11px] sm:min-h-0"
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Institution Profile"}
              </Button>
            )}
          </form>

          <form
            onSubmit={handleSaveGeneral}
            className="space-y-6 rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 border-b pb-3">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Admission Fee Configuration</h2>
                {!isAdmin && (
                  <p className="text-xs text-muted-foreground">
                    View-only for Managers. Only the School Admin can update
                    admission fees.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admissionFee">Admission Fee (BDT)</Label>
              <Input
                id="admissionFee"
                type="number"
                min={0}
                step="0.01"
                required
                disabled={!isAdmin}
                value={admissionFee}
                onChange={(e) => setAdmissionFee(e.target.value)}
                placeholder="e.g. 1500"
              />
            </div>

            {isAdmin && (
              <Button
                type="submit"
                disabled={updateFeeMutation.isPending}
                className="min-h-[44px] gap-2 rounded-[11px] sm:min-h-0"
              >
                <Save className="h-4 w-4" />
                {updateFeeMutation.isPending
                  ? "Saving..."
                  : "Save General Settings"}
              </Button>
            )}
          </form>

          <div className="rounded-xl border bg-card p-6">
            <FileUpload
              category="SCHOOL_LOGO"
              label="Institution Logo"
              currentUrl={schoolProfile?.logo ?? null}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMb={5}
              disabled={!isAdmin || updateProfileMutation.isPending}
              onUploaded={(file) => {
                updateProfileMutation.mutate({ logo: file.url });
              }}
              onRemoved={() => {
                updateProfileMutation.mutate({ logo: null });
              }}
            />
            {!isAdmin && (
              <p className="mt-2 text-xs text-muted-foreground">
                Only the School Admin can update the institution logo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolSettingsView;

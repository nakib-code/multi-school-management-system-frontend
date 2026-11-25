"use client";

import { ArrowLeft, Save, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MobileAccountType } from "@/features/payments/types";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/features/platform-settings/hooks";

const ACCOUNT_TYPES: MobileAccountType[] = ["PERSONAL", "MERCHANT", "AGENT"];

export default function PlatformPaymentSettingsPage() {
  const { data: setting, isLoading } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();

  const [platformName, setPlatformName] = useState("MadrasaOS");
  const [supportPhone, setSupportPhone] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [bkashType, setBkashType] = useState<MobileAccountType>("PERSONAL");
  const [nagadNumber, setNagadNumber] = useState("");
  const [nagadType, setNagadType] = useState<MobileAccountType>("PERSONAL");
  const [rocketNumber, setRocketNumber] = useState("");
  const [rocketType, setRocketType] = useState<MobileAccountType>("PERSONAL");
  const [paymentInstruction, setPaymentInstruction] = useState("");

  useEffect(() => {
    if (setting) {
      setPlatformName(setting.platformName ?? "MadrasaOS");
      setSupportPhone(setting.supportPhone ?? "");
      setBkashNumber(setting.bkashNumber ?? "");
      setBkashType(setting.bkashType ?? "PERSONAL");
      setNagadNumber(setting.nagadNumber ?? "");
      setNagadType(setting.nagadType ?? "PERSONAL");
      setRocketNumber(setting.rocketNumber ?? "");
      setRocketType(setting.rocketType ?? "PERSONAL");
      setPaymentInstruction(setting.paymentInstruction ?? "");
    }
  }, [setting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      platformName: platformName.trim() || "MadrasaOS",
      supportPhone: supportPhone.trim() || null,
      bkashNumber: bkashNumber.trim() || null,
      bkashType,
      nagadNumber: nagadNumber.trim() || null,
      nagadType,
      rocketNumber: rocketNumber.trim() || null,
      rocketType,
      paymentInstruction: paymentInstruction.trim() || null,
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading platform payment settings..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/super-admin/settings"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Platform Payment Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the bKash, Nagad, and Rocket accounts displayed to School
            Admins when paying for SaaS subscriptions.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6"
      >
        <div className="flex items-center gap-2 border-b pb-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">
            Super Admin Mobile Banking Accounts (SaaS Billing)
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="MadrasaOS"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supportPhone">Billing Support Phone</Label>
            <Input
              id="supportPhone"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bkashNumber">bKash Number</Label>
              <Input
                id="bkashNumber"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
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
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
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
                value={rocketNumber}
                onChange={(e) => setRocketNumber(e.target.value)}
                placeholder="01XXXXXXXXXX"
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
        </div>

        <div className="space-y-1.5 border-t pt-4">
          <Label htmlFor="paymentInstruction">Payment Instructions</Label>
          <Textarea
            id="paymentInstruction"
            rows={3}
            value={paymentInstruction}
            onChange={(e) => setPaymentInstruction(e.target.value)}
            placeholder="Instructions shown to School Admins on the subscription billing page..."
          />
        </div>

        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Platform Settings"}
        </Button>
      </form>
    </div>
  );
}

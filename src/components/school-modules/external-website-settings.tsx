"use client";

import {
  Check,
  Copy,
  Globe,
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useRotateWebsiteKey,
  useUpdateWebsiteConnection,
  useWebsiteConnection,
} from "@/features/school-settings/hooks";

export function ExternalWebsiteSettings({
  schoolId,
  isAdmin,
}: {
  schoolId: number;
  isAdmin: boolean;
}) {
  const { data, isLoading } = useWebsiteConnection(schoolId);
  const updateMut = useUpdateWebsiteConnection(schoolId);
  const rotateMut = useRotateWebsiteKey(schoolId);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setWebsiteUrl(data.externalWebsiteUrl ?? "");
      setAdminEmail(data.landingAdminEmail ?? "");
    }
  }, [data]);

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMut.mutateAsync({
      externalWebsiteUrl: websiteUrl.trim() || null,
      landingAdminEmail: adminEmail.trim() || null,
      ...(adminPassword.trim()
        ? { landingAdminPassword: adminPassword.trim() }
        : {}),
    });
    setAdminPassword("");
  };

  const handleRotateKey = async () => {
    if (
      data?.hasConnectionKey &&
      !window.confirm(
        "Rotate the website connection key? The previous key will stop working until you paste the new key into your landing website's /admin dashboard.",
      )
    ) {
      return;
    }
    const res = await rotateMut.mutateAsync();
    setGeneratedKey(res.connectionKey);
  };

  const handleToggleOnlineAdmission = async () => {
    if (!isAdmin || !data) return;
    await updateMut.mutateAsync({
      hasOnlineAdmission: !data.hasOnlineAdmission,
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading website connection settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Copyable Connection Details */}
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold">
                External School Website Connection
              </h2>
              <p className="text-xs text-muted-foreground">
                Connect your custom Next.js school website directly to this
                management dashboard for live online admissions &amp; tracking.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                data?.hasOnlineAdmission
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {data?.hasOnlineAdmission
                ? "Online Admission Active"
                : "Online Admission Paused"}
            </span>
            {isAdmin && (
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(data?.hasOnlineAdmission)}
                aria-label="Toggle Online Admission"
                disabled={updateMut.isPending}
                onClick={handleToggleOnlineAdmission}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
                  data?.hasOnlineAdmission
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    data?.hasOnlineAdmission ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <p className="text-[11px] font-medium uppercase text-muted-foreground">
              Backend API URL
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <code className="truncate text-xs font-semibold">
                {data?.apiBaseUrl ?? "—"}
              </code>
              {data?.apiBaseUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copyValue("Backend API URL", data.apiBaseUrl)}
                  className="h-7 px-2"
                >
                  {copiedField === "Backend API URL" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3.5">
            <p className="text-[11px] font-medium uppercase text-muted-foreground">
              School ID
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <code className="text-xs font-semibold">
                {data?.schoolId ?? schoolId} ({data?.schoolCode})
              </code>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyValue("School ID", String(data?.schoolId ?? schoolId))
                }
                className="h-7 px-2"
              >
                {copiedField === "School ID" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Key Section */}
        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <KeyRound className="h-4 w-4 text-primary" />
                Website Connection Key
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {data?.hasConnectionKey
                  ? `Active key ending in ${data.keyPreview ?? "****"}`
                  : "No key generated yet. Generate one to link your landing site."}
              </p>
            </div>

            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={rotateMut.isPending}
                onClick={handleRotateKey}
                className="gap-1.5"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${rotateMut.isPending ? "animate-spin" : ""}`}
                />
                {data?.hasConnectionKey
                  ? "Rotate Connection Key"
                  : "Generate Connection Key"}
              </Button>
            )}
          </div>

          {generatedKey && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-950">
              <p className="text-xs font-semibold">
                Copy this key now — it will only be shown once:
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <code className="break-all font-mono text-xs font-bold">
                  {generatedKey}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyValue("Connection Key", generatedKey)}
                  className="shrink-0 gap-1 bg-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Key
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Website URL & Landing Admin Credentials Form */}
      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-xl border bg-card p-6"
      >
        <div className="flex items-center gap-2 border-b pb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">
              Website Origin &amp; Landing Admin Login Credentials
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? "Control your external website's allowed CORS origin and its /admin login email & password from here."
                : "View-only for Managers. Only the School Admin can update website connection credentials."}
            </p>
          </div>
        </div>

        <fieldset disabled={!isAdmin} className="space-y-4 disabled:opacity-75">
          <div className="space-y-1.5">
            <Label htmlFor="externalWebsiteUrl">External Website URL</Label>
            <Input
              id="externalWebsiteUrl"
              placeholder="https://darululoom.edu.bd"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use https:// (or http://localhost:3001 in local development).
              Automatically whitelisted for CORS.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="landingAdminEmail">
                Landing Website Admin Email
              </Label>
              <Input
                id="landingAdminEmail"
                type="email"
                placeholder="webadmin@darululoom.edu.bd"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="landingAdminPassword">
                Landing Website Admin Password
              </Label>
              <Input
                id="landingAdminPassword"
                type="password"
                placeholder={
                  data?.hasLandingAdminPassword
                    ? "Leave blank to keep current password"
                    : "Set password (min 6 chars)"
                }
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        {isAdmin && (
          <Button
            type="submit"
            disabled={updateMut.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMut.isPending
              ? "Saving..."
              : "Set / Update Website & Credentials"}
          </Button>
        )}
      </form>

      {/* 3-Step Setup Guide */}
      <div className="rounded-xl border bg-muted/20 p-5 text-sm">
        <h3 className="font-semibold">How to link your landing website</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs text-muted-foreground">
          <li>
            Enter your external website URL, set a Landing Admin Email &amp;
            Password above, and click <strong>Generate Connection Key</strong>.
          </li>
          <li>
            Open <code>/admin</code> on your landing website and paste the{" "}
            <strong>Backend API URL</strong>, <strong>School ID</strong>, and{" "}
            <strong>Website Connection Key</strong>.
          </li>
          <li>
            Click <strong>Test &amp; Save Connection</strong> — online admission
            forms and tracking will immediately sync with this dashboard.
          </li>
        </ol>
      </div>
    </div>
  );
}

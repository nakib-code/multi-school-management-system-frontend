"use client";

import { Plus, SlidersHorizontal, XCircle } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelCustomPackageRequest,
  useCreateCustomPackageRequest,
  useMyCustomPackageRequests,
} from "@/features/custom-packages/hooks";
import { PACKAGE_FEATURES } from "@/features/super-admin/packages/constants";
import type { BillingCycle, PackageFeature } from "@/features/super-admin/packages/type";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function CustomPackageWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const { data: requests = [], isLoading, isError, error, refetch } =
    useMyCustomPackageRequests();
  const createMut = useCreateCustomPackageRequest();
  const cancelMut = useCancelCustomPackageRequest();

  const [open, setOpen] = useState(false);
  const [studentLimit, setStudentLimit] = useState("500");
  const [price, setPrice] = useState("5000");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [description, setDescription] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<PackageFeature[]>([
    "STUDENT_MANAGEMENT",
    "TEACHER_MANAGEMENT",
    "CLASS_MANAGEMENT",
    "ATTENDANCE",
    "HEFZ_MODULE",
  ]);

  const toggleFeature = (feature: PackageFeature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFeatures.length === 0 || !schoolId) return;
    await createMut.mutateAsync({
      schoolId,
      requestedStudentLimit: Number(studentLimit),
      requestedPrice: Number(price),
      billingCycle,
      ...(description.trim() ? { description: description.trim() } : {}),
      features: selectedFeatures.map((feature) => ({ feature, enabled: true })),
    });
    setOpen(false);
    setDescription("");
  };

  if (isLoading) return <LoadingState message="Loading custom package requests..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load custom package requests")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Plan Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Request a tailored student capacity and module package from the platform team.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Custom Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No custom package requests"
          description="Submit a custom plan request if you need higher student capacity or specific modules."
        />
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    Up to {req.requestedStudentLimit.toLocaleString()} students • ৳
                    {Number(req.requestedPrice).toLocaleString()} ({req.billingCycle})
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {new Date(req.createdAt).toLocaleDateString()} •{" "}
                    {req.features.length} features
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                    {req.status}
                  </span>
                  {req.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelMut.mutate(req.id)}
                      disabled={cancelMut.isPending}
                      className="gap-1 text-destructive"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              {req.reviewNote && (
                <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  Review Note: {req.reviewNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Request Custom Package" maxWidthClass="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Student Limit</Label>
              <Input
                type="number"
                min={10}
                required
                value={studentLimit}
                onChange={(e) => setStudentLimit(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Proposed Price (BDT)</Label>
              <Input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Billing Cycle</Label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Required Modules ({selectedFeatures.length})</Label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-3">
              {PACKAGE_FEATURES.map((f) => (
                <label key={f.value} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(f.value)}
                    onChange={() => toggleFeature(f.value)}
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your institution requirements..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending || selectedFeatures.length === 0}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

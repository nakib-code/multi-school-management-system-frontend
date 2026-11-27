"use client";

import { Save, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMe } from "@/features/auth/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function SelfProfileForm() {
  const { user } = useAuth();
  const updateMutation = useUpdateMe();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatarUrl ?? null,
  );

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || null,
        avatarUrl,
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update profile"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-card p-6"
    >
      <div className="flex items-center gap-2 border-b pb-3">
        <UserIcon className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">My Profile</h2>
          <p className="text-xs text-muted-foreground">
            Update your display name, phone number, and profile photo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email (read-only)</Label>
          <Input id="profile-email" value={user?.email ?? ""} disabled />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-phone">Phone Number</Label>
          <Input
            id="profile-phone"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-role">Role</Label>
          <Input id="profile-role" value={user?.role ?? ""} disabled />
        </div>
      </div>

      <FileUpload
        category="USER_AVATAR"
        label="Profile Photo"
        currentUrl={avatarUrl}
        accept="image/jpeg,image/png,image/webp"
        maxSizeMb={3}
        onUploaded={(file) => setAvatarUrl(file.url)}
        onRemoved={() => setAvatarUrl(null)}
      />

      <Button
        type="submit"
        disabled={updateMutation.isPending}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {updateMutation.isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}

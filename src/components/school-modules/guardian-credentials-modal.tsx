"use client";

import { Check, Copy, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";

export interface GuardianCredentialsData {
  name: string;
  phone: string;
  temporaryPassword: string;
  studentName?: string;
}

interface GuardianCredentialsModalProps {
  credentials: GuardianCredentialsData | null;
  onClose: () => void;
}

const toWhatsAppDigits = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) {
    return `88${digits}`;
  }
  if (digits.startsWith("8801") && digits.length === 13) {
    return digits;
  }
  return digits;
};

export function GuardianCredentialsModal({
  credentials,
  onClose,
}: GuardianCredentialsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const loginUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/login`
      : "/auth/login";

  const shareMessage = [
    `আসসালামু আলাইকুম ${credentials.name},`,
    credentials.studentName
      ? `${credentials.studentName}-এর অভিভাবক পোর্টাল লগইন তথ্য:`
      : "আপনার অভিভাবক পোর্টাল লগইন তথ্য:",
    `Login Link: ${loginUrl}`,
    `Phone (Login ID): ${credentials.phone}`,
    `Temporary Password: ${credentials.temporaryPassword}`,
    "লগইন করার পর পাসওয়ার্ড পরিবর্তন করে নিন।",
  ].join("\n");

  const waDigits = toWhatsAppDigits(credentials.phone);
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(shareMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Login ID: ${credentials.phone}\nPassword: ${credentials.temporaryPassword}\nLink: ${loginUrl}`,
      );
      setCopied(true);
      toast.success("Login credentials copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Guardian Login Credentials"
      description="Shown once — copy or share directly via WhatsApp at zero SMS cost."
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-sm">
        <div className="space-y-2.5 rounded-[11px] border bg-muted/30 p-3.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Guardian</span>
            <span className="font-semibold text-foreground">
              {credentials.name}
            </span>
          </div>
          {credentials.studentName && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium text-foreground">
                {credentials.studentName}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 border-t pt-2">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              Login ID (Phone)
            </span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {credentials.phone}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-2">
            <span className="text-muted-foreground">Temporary Password</span>
            <div className="flex items-center gap-1.5">
              <code className="rounded bg-background px-2 py-0.5 font-mono text-sm font-bold text-primary">
                {credentials.temporaryPassword}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-8 px-2"
                aria-label="Copy credentials"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Info"}
          </Button>

          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[11px] bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:min-h-0 sm:py-2"
          >
            <MessageCircle className="h-4 w-4" />
            Share via WhatsApp
          </a>
        </div>

        <div className="flex justify-end border-t pt-3">
          <Button type="button" onClick={onClose} className="rounded-[11px]">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

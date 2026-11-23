"use client";

import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  type UploadCategory,
  type UploadedFileRecord,
  useDeleteUploadedFile,
  useUploadFile,
} from "@/features/uploads/hooks";

interface FileUploadProps {
  category: UploadCategory;
  label?: string;
  currentUrl?: string | null;
  accept?: string;
  maxSizeMb?: number;
  onUploaded?: (file: UploadedFileRecord) => void;
}

export function FileUpload({
  category,
  label = "Upload Image",
  currentUrl,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMb = 5,
  onUploaded,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [uploadedId, setUploadedId] = useState<number | null>(null);

  const uploadMut = useUploadFile();
  const deleteMut = useDeleteUploadedFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File exceeds maximum size of ${maxSizeMb}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      try {
        const record = await uploadMut.mutateAsync({
          dataUrl,
          category,
          fileName: file.name,
        });
        setPreviewUrl(record.url);
        setUploadedId(record.id);
        onUploaded?.(record);
      } catch {
        // Toast already shown by hook
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (uploadedId) {
      await deleteMut.mutateAsync(uploadedId);
      setUploadedId(null);
    }
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed bg-muted/20 p-4">
        {previewUrl && !previewUrl.endsWith(".pdf") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={label}
            className="h-16 w-16 rounded-lg border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
          </div>
        )}

        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">
            Allowed: JPEG, PNG, WEBP{accept.includes("pdf") ? ", PDF" : ""} • Max {maxSizeMb}MB
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploadMut.isPending}
              onClick={() => inputRef.current?.click()}
              className="gap-1.5"
            >
              {uploadMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              {uploadMut.isPending
                ? "Uploading..."
                : previewUrl
                  ? "Replace File"
                  : "Choose File"}
            </Button>

            {previewUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={deleteMut.isPending}
                onClick={handleRemove}
                className="gap-1 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

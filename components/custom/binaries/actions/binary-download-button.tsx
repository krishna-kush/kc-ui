"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { binaryApi } from "@/lib/api";

interface BinaryDownloadButtonProps {
  binaryId: string;
  binaryName?: string;
  disabled?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function BinaryDownloadButton({
  binaryId,
  binaryName,
  disabled = false,
  variant = "icon",
  className,
}: BinaryDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");
    try {
      setIsDownloading(true);
      await binaryApi.download(binaryId);
      toast.success(
        binaryName ? `Download started: ${binaryName}` : "Download started",
        { id: toastId }
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to download binary", {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={variant === "icon" ? "icon" : "sm"}
      className={variant === "icon" ? "h-8 w-8" : className}
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      title="Download binary"
    >
      <Download className="h-4 w-4" />
      {variant === "button" && <span className="ml-2">Download</span>}
    </Button>
  );
}

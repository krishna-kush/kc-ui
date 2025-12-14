"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { binaryApi } from "@/lib/api";
import { ErrorDialog } from "@/components/custom/common/error-dialog";

interface LicenseDownloadButtonProps {
  binaryId: string;
  licenseId: string;
  disabled?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function LicenseDownloadButton({
  binaryId,
  licenseId,
  disabled = false,
  variant = "icon",
  className,
}: LicenseDownloadButtonProps) {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorContent, setErrorContent] = useState({
    title: "",
    description: "",
  });

  const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");
    try {
      await binaryApi.download(binaryId, licenseId);
      toast.success("Download started", { id: toastId });
    } catch (error: any) {
      console.error("Download error:", error);
      if (
        error.message?.includes("Storage quota exceeded") ||
        error.message?.includes("not enough space")
      ) {
        toast.dismiss(toastId);
        setErrorContent({
          title: "Download Failed: Storage Quota Exceeded",
          description: error.message,
        });
        setErrorDialogOpen(true);
      } else {
        toast.error(error.message || "Failed to download", { id: toastId });
      }
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size={variant === "icon" ? "icon" : "sm"}
        className={variant === "icon" ? "h-8 w-8" : className}
        onClick={handleDownload}
        disabled={disabled}
        title="Download merged binary"
      >
        <Download className="h-4 w-4" />
        {variant === "button" && <span className="ml-2">Download</span>}
      </Button>

      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        title={errorContent.title}
        description={errorContent.description}
      />
    </>
  );
}

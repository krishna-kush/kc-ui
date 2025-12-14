"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { licenseApi } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { ConfirmDialog } from "@/components/custom/common/confirm-dialog";

interface LicenseRevokeButtonProps {
  licenseId: string;
  onSuccess?: () => void;
  disabled?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function LicenseRevokeButton({
  licenseId,
  onSuccess,
  disabled = false,
  variant = "icon",
  className,
}: LicenseRevokeButtonProps) {
  const { addNotification } = useNotifications();
  const [showDialog, setShowDialog] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    try {
      setIsRevoking(true);
      await licenseApi.revoke(licenseId);
      toast.success("License revoked successfully!");

      await addNotification({
        title: "License Revoked",
        message: "The license has been revoked and can no longer be used.",
        type: "warning",
      });

      setShowDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to revoke license");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size={variant === "icon" ? "icon" : "sm"}
        className={
          variant === "icon"
            ? "h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            : `text-destructive hover:bg-destructive hover:text-destructive-foreground ${className}`
        }
        onClick={() => setShowDialog(true)}
        disabled={disabled}
        title="Revoke license"
      >
        <XCircle className="h-4 w-4" />
        {variant === "button" && <span className="ml-2">Revoke</span>}
      </Button>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Revoke License"
        description="Are you sure you want to revoke this license? It can no longer be used."
        onConfirm={handleRevoke}
        confirmText={isRevoking ? "Revoking..." : "Revoke License"}
        variant="destructive"
      />
    </>
  );
}

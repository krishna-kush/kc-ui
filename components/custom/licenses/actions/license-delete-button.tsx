"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { licenseApi } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { ConfirmDialog } from "@/components/custom/common/confirm-dialog";

interface LicenseDeleteButtonProps {
  licenseId: string;
  isRevoked?: boolean;
  onSuccess?: () => void;
  disabled?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function LicenseDeleteButton({
  licenseId,
  isRevoked = false,
  onSuccess,
  disabled = false,
  variant = "icon",
  className,
}: LicenseDeleteButtonProps) {
  const { addNotification } = useNotifications();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // First revoke the license if not already revoked
      if (!isRevoked) {
        await licenseApi.revoke(licenseId);
      }
      // Then delete it
      await licenseApi.delete(licenseId);
      toast.success("License revoked and deleted successfully!");

      await addNotification({
        title: "License Deleted",
        message: "The license has been revoked and permanently deleted.",
        type: "info",
      });

      setShowDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete license");
    } finally {
      setIsDeleting(false);
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
        title="Delete license"
      >
        <Trash2 className="h-4 w-4" />
        {variant === "button" && <span className="ml-2">Delete</span>}
      </Button>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Delete License"
        description="Are you sure you want to delete this license? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete License"}
        variant="destructive"
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { binaryApi } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { ConfirmDialog } from "@/components/custom/common/confirm-dialog";

interface BinaryDeleteButtonProps {
  binaryId: string;
  binaryName?: string;
  onSuccess?: () => void;
  disabled?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function BinaryDeleteButton({
  binaryId,
  binaryName,
  onSuccess,
  disabled = false,
  variant = "icon",
  className,
}: BinaryDeleteButtonProps) {
  const { addNotification } = useNotifications();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await binaryApi.delete(binaryId);
      toast.success("Binary deleted successfully!");

      await addNotification({
        title: "Binary Deleted",
        message: binaryName
          ? `${binaryName} has been deleted.`
          : "The binary has been deleted.",
        type: "warning",
      });

      setShowDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete binary");
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
        title="Delete binary"
      >
        <Trash2 className="h-4 w-4" />
        {variant === "button" && <span className="ml-2">Delete</span>}
      </Button>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Delete Binary"
        description={
          binaryName
            ? `Are you sure you want to delete "${binaryName}"? All associated licenses will also be deleted. This action cannot be undone.`
            : "Are you sure you want to delete this binary? All associated licenses will also be deleted. This action cannot be undone."
        }
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete Binary"}
        variant="destructive"
      />
    </>
  );
}

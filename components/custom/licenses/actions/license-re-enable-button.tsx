"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { licenseApi } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";

interface LicenseReEnableButtonProps {
  licenseId: string;
  onSuccess?: () => void;
  disabled?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function LicenseReEnableButton({
  licenseId,
  onSuccess,
  disabled = false,
  variant = "icon",
  className,
}: LicenseReEnableButtonProps) {
  const { addNotification } = useNotifications();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleReEnable = async () => {
    try {
      setIsEnabling(true);
      await licenseApi.update(licenseId, { revoked: false });
      toast.success("License re-enabled successfully!");

      await addNotification({
        title: "License Re-enabled",
        message: "The license has been re-enabled and can be used again.",
        type: "success",
      });

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to re-enable license");
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={variant === "icon" ? "icon" : "sm"}
      className={
        variant === "icon"
          ? "h-8 w-8 text-green-600 hover:bg-green-600 hover:text-white"
          : `text-green-600 hover:bg-green-600 hover:text-white ${className}`
      }
      onClick={handleReEnable}
      disabled={disabled || isEnabling}
      title="Re-enable license"
    >
      <CheckCircle className="h-4 w-4" />
      {variant === "button" && (
        <span className="ml-2">{isEnabling ? "Enabling..." : "Re-enable"}</span>
      )}
    </Button>
  );
}

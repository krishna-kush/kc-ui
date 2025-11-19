"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { licenseApi } from "@/lib/api";

interface License {
  license_id: string;
  license_type: string;
  check_interval_ms?: number;
  kill_method?: string;
  max_executions?: number;
  expires_at?: string;
}

interface EditLicenseDialogProps {
  license: License | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditLicenseDialog({ license, open, onOpenChange, onSuccess }: EditLicenseDialogProps) {
  const [checkInterval, setCheckInterval] = useState("");
  const [killMethod, setKillMethod] = useState("stop");
  const [maxExecutions, setMaxExecutions] = useState("");
  const [expirationDays, setExpirationDays] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (license) {
      setCheckInterval(license.check_interval_ms?.toString() || "");
      setKillMethod(license.kill_method || "stop");
      setMaxExecutions(license.max_executions?.toString() || "");
      
      // Calculate days until expiration
      if (license.expires_at) {
        const now = new Date();
        const expiresAt = new Date(license.expires_at);
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setExpirationDays(daysRemaining > 0 ? daysRemaining.toString() : "");
      } else {
        setExpirationDays("");
      }
    }
  }, [license]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!license) return;

    // Read-only licenses can't be edited
    if (license.license_type === 'readonly') {
      toast.error('Read-only licenses cannot be edited');
      return;
    }

    setUpdating(true);
    try {
      const data: any = {};

      if (checkInterval) {
        data.check_interval_ms = parseInt(checkInterval);
      }

      if (killMethod) {
        data.kill_method = killMethod;
      }

      if (maxExecutions) {
        data.max_executions = parseInt(maxExecutions);
      }

      if (expirationDays) {
        const expiresInSeconds = parseInt(expirationDays) * 24 * 60 * 60;
        data.expires_in_seconds = expiresInSeconds;
      }

      await licenseApi.update(license.license_id, data);
      toast.success("License updated successfully!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update license");
    } finally {
      setUpdating(false);
    }
  };

  if (!license) return null;

  const isReadOnly = license.license_type === 'readonly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit License Settings
            {isReadOnly && (
              <Badge variant="secondary" className="ml-2">Read-Only</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="checkInterval">Check Interval (ms)</Label>
                {license.license_type === "patchable" && (
                  <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                )}
                {license.license_type === "readonly" && (
                  <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                )}
              </div>
              <Input
                id="checkInterval"
                type="number"
                value={checkInterval}
                onChange={(e) => setCheckInterval(e.target.value)}
                placeholder="60000"
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">
                Time between verification checks (in overload binary). Can be updated at runtime for patchable licenses.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="killMethod">Kill Method</Label>
                {license.license_type === "patchable" && (
                  <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                )}
                {license.license_type === "readonly" && (
                  <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                )}
              </div>
              <select
                id="killMethod"
                value={killMethod}
                onChange={(e) => setKillMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isReadOnly}
              >
                <option value="stop">Stop - Just terminate the process</option>
                <option value="delete">Delete - Remove the binary file</option>
                <option value="shred">Shred - Securely wipe the binary (3-pass)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                What happens when license is revoked or invalid. Can be updated at runtime for patchable licenses.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="maxExecutions">Max Executions</Label>
                {license.license_type === "patchable" && (
                  <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                )}
                {license.license_type === "readonly" && (
                  <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                )}
              </div>
              <Input
                id="maxExecutions"
                type="number"
                value={maxExecutions}
                onChange={(e) => setMaxExecutions(e.target.value)}
                placeholder="Leave empty for unlimited"
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of times this license can be used (server-side limit).
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="expirationDays">Extend Expiration (days)</Label>
                {license.license_type === "patchable" && (
                  <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                )}
                {license.license_type === "readonly" && (
                  <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                )}
              </div>
              <Input
                id="expirationDays"
                type="number"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                placeholder="Leave empty for no expiration"
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">
                Current expiration: {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updating || isReadOnly}>
              {updating ? "Updating..." : "Update License"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

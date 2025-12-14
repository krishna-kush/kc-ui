"use client";

import { License } from "@/types";
import { LicenseDownloadButton } from "./license-download-button";
import { LicenseRevokeButton } from "./license-revoke-button";
import { LicenseReEnableButton } from "./license-re-enable-button";
import { LicenseDeleteButton } from "./license-delete-button";
import { EditLicenseDialog } from "../edit-license-dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";

interface LicenseActionBarProps {
  license:
    | License
    | {
        license_id: string;
        binary_id: string;
        revoked: boolean;
        license_type?: string;
        max_executions?: number | null;
        expires_at?: string | null;
      };
  binaryId?: string;
  onSuccess?: () => void;
  showEdit?: boolean;
  showDownload?: boolean;
  className?: string;
}

export function LicenseActionBar({
  license,
  binaryId,
  onSuccess,
  showEdit = true,
  showDownload = true,
  className,
}: LicenseActionBarProps) {
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const effectiveBinaryId = binaryId || license.binary_id;

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {showDownload && (
        <LicenseDownloadButton
          binaryId={effectiveBinaryId}
          licenseId={license.license_id}
          disabled={license.revoked}
        />
      )}

      {showEdit && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditingLicense(license)}
            disabled={license.revoked}
            title="Edit license"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <EditLicenseDialog
            license={editingLicense}
            open={!!editingLicense}
            onOpenChange={(open) => !open && setEditingLicense(null)}
            onSuccess={() => {
              setEditingLicense(null);
              onSuccess?.();
            }}
          />
        </>
      )}

      {!license.revoked ? (
        <LicenseRevokeButton
          licenseId={license.license_id}
          onSuccess={onSuccess}
        />
      ) : (
        <LicenseReEnableButton
          licenseId={license.license_id}
          onSuccess={onSuccess}
        />
      )}

      <LicenseDeleteButton
        licenseId={license.license_id}
        isRevoked={license.revoked}
        onSuccess={onSuccess}
      />
    </div>
  );
}

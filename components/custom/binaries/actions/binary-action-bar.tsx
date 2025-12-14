"use client";

import { Binary } from "@/types";
import { BinaryDownloadButton } from "./binary-download-button";
import { BinaryDeleteButton } from "./binary-delete-button";

interface BinaryActionBarProps {
  binary:
    | Binary
    | {
        binary_id: string;
        original_name?: string;
      };
  onSuccess?: () => void;
  showDownload?: boolean;
  className?: string;
}

export function BinaryActionBar({
  binary,
  onSuccess,
  showDownload = true,
  className,
}: BinaryActionBarProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {showDownload && (
        <BinaryDownloadButton
          binaryId={binary.binary_id}
          binaryName={binary.original_name}
        />
      )}

      <BinaryDeleteButton
        binaryId={binary.binary_id}
        binaryName={binary.original_name}
        onSuccess={onSuccess}
      />
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortableTable } from "@/components/sortable-table";
import { CheckCircle, XCircle } from "lucide-react";
import { EmptyState } from "@/components/custom/common/empty-state";

interface VerificationAttempt {
  timestamp: string;
  license_id?: string;
  machine_fingerprint?: string;
  ip_address?: string;
  success: boolean;
  error_message?: string;
}

interface VerificationAttemptsTableProps {
  attempts: VerificationAttempt[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showLicenseId?: boolean;
}

export function VerificationAttemptsTable({
  attempts,
  loading,
  page,
  totalPages,
  onPageChange,
  showLicenseId = true,
}: VerificationAttemptsTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    );
  }

  if (attempts.length === 0) {
    return (
      <EmptyState
        title="No verification attempts yet"
        className="py-8 text-muted-foreground"
      />
    );
  }

  const columns = [
    {
      header: "Time",
      accessorKey: "timestamp",
      cell: (attempt: VerificationAttempt) => (
        <span className="font-mono text-xs">
          {attempt.timestamp
            ? new Date(attempt.timestamp).toLocaleString()
            : "-"}
        </span>
      ),
    },
    ...(showLicenseId
      ? [
          {
            header: "License",
            accessorKey: "license_id",
            cell: (attempt: VerificationAttempt) => (
              <span className="font-mono text-xs">
                {attempt.license_id
                  ? `${attempt.license_id.substring(0, 12)}...`
                  : "-"}
              </span>
            ),
          },
        ]
      : []),
    {
      header: "Machine",
      accessorKey: "machine_fingerprint",
      cell: (attempt: VerificationAttempt) => (
        <span className="font-mono text-xs">
          {attempt.machine_fingerprint
            ? `${attempt.machine_fingerprint.substring(0, 12)}...`
            : "-"}
        </span>
      ),
    },
    {
      header: "IP Address",
      accessorKey: "ip_address",
      cell: (attempt: VerificationAttempt) => (
        <span className="text-xs">{attempt.ip_address || "-"}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "success",
      cell: (attempt: VerificationAttempt) =>
        attempt.success ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Success
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        ),
    },
    {
      header: "Reason",
      accessorKey: "error_message",
      cell: (attempt: VerificationAttempt) => (
        <span className="text-xs text-muted-foreground">
          {attempt.error_message || "-"}
        </span>
      ),
    },
  ];

  return (
    <>
      <SortableTable
        data={attempts}
        columns={columns}
        emptyMessage="No verification attempts yet"
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}

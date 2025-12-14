import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface LicenseStatusBadgeProps {
  revoked: boolean;
  expires_at?: string | null;
  max_executions?: number | null;
  executions_used?: number;
}

export function LicenseStatusBadge({
  revoked,
  expires_at,
  max_executions,
  executions_used = 0,
}: LicenseStatusBadgeProps) {
  if (revoked) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Revoked
      </Badge>
    );
  }

  if (expires_at && new Date(expires_at) < new Date()) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  if (max_executions && executions_used >= max_executions) {
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Limit Reached
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1 bg-green-600">
      <CheckCircle className="h-3 w-3" />
      Active
    </Badge>
  );
}

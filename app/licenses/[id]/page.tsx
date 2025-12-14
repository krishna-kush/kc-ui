"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Monitor, Activity, Edit } from "lucide-react";
import { toast } from "sonner";
import { licenseApi, binaryApi } from "@/lib/api";
import { SortableTable, ColumnDef } from "@/components/sortable-table";
import { EditLicenseDialog } from "@/components/custom/licenses/edit-license-dialog";
import { VerificationAttemptsTable } from "@/components/custom/common/verification-attempts-table";
import {
  LicenseDownloadButton,
  LicenseRevokeButton,
  LicenseReEnableButton,
  LicenseDeleteButton,
} from "@/components/custom/licenses/actions";

interface License {
  license_id: string;
  binary_id: string;
  license_type: string;
  sync_mode: boolean;
  check_interval_ms?: number;
  grace_period: number;
  kill_method: string;
  max_executions?: number;
  executions_used: number;
  created_at: string;
  expires_at?: string;
  revoked: boolean;
}

interface BinaryInstance {
  machine_fingerprint: string;
  first_seen: string;
  last_seen: string;
  status: "active" | "inactive" | "unknown";
  total_checks: number;
  last_ip?: string;
}

interface VerificationAttempt {
  timestamp: string;
  success: boolean;
  machine_fingerprint: string;
  ip_address: string;
  error_message?: string;
  failed_attempts: number;
  within_grace_period: boolean;
}

interface LicenseStats {
  license: License;
  unique_computers: number;
  active_computers: number;
  inactive_computers: number;
  unknown_computers: number;
  instances: BinaryInstance[];
  recent_verifications: VerificationAttempt[];
}

export default function LicenseStatsPage() {
  const params = useParams();
  const router = useRouter();
  const licenseId = params.id as string;

  const [stats, setStats] = useState<LicenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadStats();
  }, [licenseId]);

  const loadStats = async () => {
    try {
      const data = await licenseApi.getStats(licenseId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error("Failed to load license stats");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const truncateFP = (fp: string) => {
    return `${fp.substring(0, 8)}...${fp.substring(fp.length - 8)}`;
  };

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <PageHeader
              title="License Stats"
              subtitle={licenseId}
              leading={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              }
              actions={
                <div className="flex items-center gap-2">
                  {stats && (
                    <>
                      <LicenseDownloadButton
                        binaryId={stats.license.binary_id}
                        licenseId={licenseId}
                        variant="button"
                        disabled={stats.license.revoked}
                      />
                      <Button
                        onClick={() => setShowEditDialog(true)}
                        size="sm"
                        variant="outline"
                        disabled={stats.license.revoked}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {!stats.license.revoked ? (
                        <LicenseRevokeButton
                          licenseId={licenseId}
                          onSuccess={loadStats}
                          variant="button"
                        />
                      ) : (
                        <LicenseReEnableButton
                          licenseId={licenseId}
                          onSuccess={loadStats}
                          variant="button"
                        />
                      )}
                      <LicenseDeleteButton
                        licenseId={licenseId}
                        isRevoked={stats.license.revoked}
                        onSuccess={() => router.push("/licenses")}
                        variant="button"
                      />
                    </>
                  )}
                </div>
              }
            />

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : stats ? (
              <div className="space-y-6">
                {/* License Info */}
                <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      License Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Type
                      </div>
                      <Badge
                        variant={
                          stats.license.license_type === "patchable"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {stats.license.license_type}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Mode
                      </div>
                      <Badge
                        variant={
                          stats.license.sync_mode ? "outline" : "secondary"
                        }
                      >
                        {stats.license.sync_mode ? "Sync" : "Async"}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Grace Period
                      </div>
                      <div className="font-medium">
                        {stats.license.grace_period}s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Kill Method
                      </div>
                      <div className="font-medium capitalize">
                        {stats.license.kill_method}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Executions
                      </div>
                      <div className="font-medium">
                        {stats.license.executions_used}
                        {stats.license.max_executions &&
                          ` / ${stats.license.max_executions}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Status
                      </div>
                      <Badge
                        variant={
                          stats.license.revoked ? "destructive" : "default"
                        }
                      >
                        {stats.license.revoked ? "Revoked" : "Active"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Computers Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {stats.unique_computers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Computers
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-500">
                        {stats.active_computers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-500">
                        {stats.inactive_computers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Inactive
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-500">
                        {stats.unknown_computers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unknown
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Instances Table */}
                <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Computer Instances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SortableTable
                      data={stats.instances}
                      columns={
                        [
                          {
                            header: "Machine",
                            accessorKey: "machine_fingerprint",
                            cell: (row) => (
                              <span className="font-mono text-xs">
                                {truncateFP(row.machine_fingerprint)}
                              </span>
                            ),
                          },
                          {
                            header: "Status",
                            accessorKey: "status",
                            cell: (row) => (
                              <Badge
                                variant={
                                  row.status === "active"
                                    ? "default"
                                    : row.status === "inactive"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {row.status === "active"
                                  ? "✓ Active"
                                  : row.status === "inactive"
                                  ? "✗ Inactive"
                                  : "? Unknown"}
                              </Badge>
                            ),
                          },
                          {
                            header: "First Seen",
                            accessorKey: "first_seen",
                            cell: (row) => (
                              <span className="text-muted-foreground">
                                {formatDate(row.first_seen)}
                              </span>
                            ),
                          },
                          {
                            header: "Last Seen",
                            accessorKey: "last_seen",
                            cell: (row) => (
                              <span className="text-muted-foreground">
                                {formatDate(row.last_seen)}
                              </span>
                            ),
                          },
                          {
                            header: "Checks",
                            accessorKey: "total_checks",
                          },
                          {
                            header: "IP",
                            accessorKey: "last_ip",
                            cell: (row) => (
                              <span className="text-muted-foreground">
                                {row.last_ip || "N/A"}
                              </span>
                            ),
                          },
                        ] as ColumnDef<BinaryInstance>[]
                      }
                      emptyMessage="No computer instances found"
                    />
                  </CardContent>
                </Card>

                {/* Recent Verifications */}
                <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Verifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VerificationAttemptsTable
                      attempts={stats.recent_verifications}
                      loading={false}
                      page={1}
                      totalPages={1}
                      onPageChange={() => {}}
                      showLicenseId={false}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                License not found
              </div>
            )}
          </motion.div>

          {/* Edit License Dialog */}
          <EditLicenseDialog
            license={stats?.license || null}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onSuccess={loadStats}
          />
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Shield, Monitor, Activity, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { licenseApi, binaryApi } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { SortableTable, ColumnDef } from "@/components/sortable-table";
import { EditLicenseDialog } from "@/components/edit-license-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  status: 'active' | 'inactive' | 'unknown';
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
  const { addNotification } = useNotifications();
  const licenseId = params.id as string;
  
  const [stats, setStats] = useState<LicenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState({ title: "", description: "" });

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



  const handleDelete = async () => {
    try {
      setDeleting(true);
      await licenseApi.delete(licenseId);
      toast.success("License deleted successfully!");
      
      await addNotification({
        title: "License Deleted",
        message: "The license has been permanently deleted.",
        type: "info",
      });
      
      router.push("/licenses");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete license");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownload = async () => {
    if (!stats) return;
    const toastId = toast.loading(`Downloading binary...`);
    try {
      const blob = await binaryApi.download(stats.license.binary_id, licenseId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merged_${licenseId.substring(0, 8)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded successfully`, { id: toastId });
    } catch (error: any) {
      console.error("Download error:", error);
      if (error.message && (error.message.includes("Storage quota exceeded") || error.message.includes("not enough space"))) {
        toast.dismiss(toastId);
        setErrorDialogContent({
          title: "Download Failed: Storage Quota Exceeded",
          description: error.message
        });
        setErrorDialogOpen(true);
      } else {
        toast.error(error.message || "Failed to download", { id: toastId });
      }
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
                  License Stats
                </h1>
                <p className="text-muted-foreground">
                  {licenseId}
                </p>
              </div>
              <div className="flex gap-2">
                {stats && (
                  <>
                    <Button onClick={() => setShowEditDialog(true)} size="lg" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Settings
                    </Button>
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      size="lg"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete License
                    </Button>
                  </>
                )}
                <Button onClick={handleDownload} size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Binary
                </Button>
              </div>
            </div>

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
                      <div className="text-sm text-muted-foreground mb-1">Type</div>
                      <Badge variant={stats.license.license_type === "patchable" ? "default" : "secondary"}>
                        {stats.license.license_type}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Mode</div>
                      <Badge variant={stats.license.sync_mode ? "outline" : "secondary"}>
                        {stats.license.sync_mode ? "Sync" : "Async"}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Grace Period</div>
                      <div className="font-medium">{stats.license.grace_period}s</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Kill Method</div>
                      <div className="font-medium capitalize">{stats.license.kill_method}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Executions</div>
                      <div className="font-medium">
                        {stats.license.executions_used}
                        {stats.license.max_executions && ` / ${stats.license.max_executions}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Status</div>
                      <Badge variant={stats.license.revoked ? "destructive" : "default"}>
                        {stats.license.revoked ? "Revoked" : "Active"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Computers Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats.unique_computers}</div>
                      <div className="text-sm text-muted-foreground">Total Computers</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-500">{stats.active_computers}</div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-500">{stats.inactive_computers}</div>
                      <div className="text-sm text-muted-foreground">Inactive</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-500">{stats.unknown_computers}</div>
                      <div className="text-sm text-muted-foreground">Unknown</div>
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
                      columns={[
                        {
                          header: "Machine",
                          accessorKey: "machine_fingerprint",
                          cell: (row) => <span className="font-mono text-xs">{truncateFP(row.machine_fingerprint)}</span>
                        },
                        {
                          header: "Status",
                          accessorKey: "status",
                          cell: (row) => (
                            <Badge variant={
                              row.status === 'active' ? 'default' : 
                              row.status === 'inactive' ? 'destructive' : 
                              'secondary'
                            }>
                              {row.status === 'active' ? '✓ Active' : 
                               row.status === 'inactive' ? '✗ Inactive' : 
                               '? Unknown'}
                            </Badge>
                          )
                        },
                        {
                          header: "First Seen",
                          accessorKey: "first_seen",
                          cell: (row) => <span className="text-muted-foreground">{formatDate(row.first_seen)}</span>
                        },
                        {
                          header: "Last Seen",
                          accessorKey: "last_seen",
                          cell: (row) => <span className="text-muted-foreground">{formatDate(row.last_seen)}</span>
                        },
                        {
                          header: "Checks",
                          accessorKey: "total_checks"
                        },
                        {
                          header: "IP",
                          accessorKey: "last_ip",
                          cell: (row) => <span className="text-muted-foreground">{row.last_ip || "N/A"}</span>
                        }
                      ] as ColumnDef<BinaryInstance>[]}
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
                    <SortableTable
                      data={stats.recent_verifications}
                      columns={[
                        {
                          header: "Time",
                          accessorKey: "timestamp",
                          cell: (row) => <span className="text-muted-foreground">{formatDate(row.timestamp)}</span>
                        },
                        {
                          header: "Result",
                          accessorKey: "success",
                          cell: (row) => (
                            <Badge variant={row.success ? "default" : "destructive"}>
                              {row.success ? "Success" : "Failed"}
                            </Badge>
                          )
                        },
                        {
                          header: "Machine",
                          accessorKey: "machine_fingerprint",
                          cell: (row) => <span className="font-mono text-xs">{truncateFP(row.machine_fingerprint)}</span>
                        },
                        {
                          header: "IP",
                          accessorKey: "ip_address",
                          cell: (row) => <span className="text-muted-foreground">{row.ip_address}</span>
                        },
                        {
                          header: "Reason",
                          accessorKey: "error_message",
                          cell: (row) => <span className="text-muted-foreground">{row.error_message || "-"}</span>
                        }
                      ] as ColumnDef<VerificationAttempt>[]}
                      emptyMessage="No recent verifications found"
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

          {/* Delete License Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete License</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this license? This action cannot be undone.
                  <br />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 inline-block">
                    {licenseId}
                  </code>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete License"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">{errorDialogContent.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {errorDialogContent.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}

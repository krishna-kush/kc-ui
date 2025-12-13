"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { binaryApi, licenseApi } from "@/lib/api";
import { Binary, License } from "@/types";
import { 
  ArrowLeft, 
  Download, 
  Key, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/contexts/NotificationContext";
import { EditLicenseDialog } from "@/components/edit-license-dialog";
import { SortableTable, ColumnDef } from "@/components/sortable-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BinaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const binaryId = params.id as string;

  const [binary, setBinary] = useState<Binary | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateLicense, setShowCreateLicense] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<License | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Verification attempts
  const [verificationAttempts, setVerificationAttempts] = useState<any[]>([]);
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [attemptsTotalPages, setAttemptsTotalPages] = useState(1);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // License creation form
  const [licenseType, setLicenseType] = useState("patchable");
  const [syncMode, setSyncMode] = useState(false);
  const [checkInterval, setCheckInterval] = useState("60000");
  const [gracePeriod, setGracePeriod] = useState("");
  const [networkFailureKillCount, setNetworkFailureKillCount] = useState("5");
  const [maxExecutions, setMaxExecutions] = useState("");
  const [expirationDays, setExpirationDays] = useState("");
  const [killMethod, setKillMethod] = useState("shred");
  const [creating, setCreating] = useState(false);



  useEffect(() => {
    fetchBinaryDetails();
  }, [binaryId]);

  useEffect(() => {
    if (binary) {
      fetchVerificationAttempts();
    }
  }, [binary, attemptsPage]);

  const fetchBinaryDetails = async () => {
    try {
      setLoading(true);
      const [binaryData, licensesData] = await Promise.all([
        binaryApi.get(binaryId),
        licenseApi.listForBinary(binaryId),
      ]);
      console.log('Binary data:', binaryData);
      console.log('Licenses data:', licensesData);
      setBinary(binaryData as any);
      setLicenses(licensesData as any);
    } catch (error) {
      console.error('Error fetching binary details:', error);
      toast.error("Failed to load binary details");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationAttempts = async () => {
    try {
      setAttemptsLoading(true);
      const limit = 20;
      const skip = (attemptsPage - 1) * limit;
      const data = await binaryApi.verificationAttempts(binaryId, limit, skip);
      setVerificationAttempts(data.attempts || []);
      setAttemptsTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error('Error fetching verification attempts:', error);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!binary) return;
    const toastId = toast.loading(`Preparing download...`);
    try {
      // This triggers browser's native download manager
      await binaryApi.download(binaryId);
      toast.success(`Download started: ${binary.original_name}`, { id: toastId });
    } catch (error) {
      toast.error("Failed to download binary", { id: toastId });
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const data: any = {
        binary_id: binaryId,
        license_type: licenseType,
        sync_mode: syncMode,
        check_interval_ms: parseInt(checkInterval) || 60000,
        network_failure_kill_count: parseInt(networkFailureKillCount) || 5,
        kill_method: killMethod,
      };

      // Only include grace_period if a value is provided (otherwise unlimited)
      if (gracePeriod) {
        data.grace_period = parseInt(gracePeriod);
      }

      if (maxExecutions) {
        data.max_executions = parseInt(maxExecutions);
      }

      if (expirationDays) {
        const expiresInSeconds = parseInt(expirationDays) * 24 * 60 * 60;
        data.expires_in_seconds = expiresInSeconds;
      }

      const response = await licenseApi.create(data);
      toast.success("License created successfully!");
      
      // Add notification
      await addNotification({
        title: "License Created",
        message: `Created new ${licenseType} license for binary. Download it to start using.`,
        type: "success",
      });
      
      setShowCreateLicense(false);
      // Reset form
      setLicenseType("patchable");
      setSyncMode(false);
      setCheckInterval("60000");
      setGracePeriod("");
      setNetworkFailureKillCount("5");
      setMaxExecutions("");
      setExpirationDays("");
      setKillMethod("shred");
      fetchBinaryDetails();
    } catch (error: any) {
      console.error('License creation error:', error);
      toast.error(error.response?.data?.error || error.message || "Failed to create license");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeLicense = async (licenseId: string) => {
    if (!confirm("Are you sure you want to revoke this license?")) return;

    try {
      await licenseApi.revoke(licenseId);
      toast.success("License revoked successfully!");
      
      await addNotification({
        title: "License Revoked",
        message: "The license has been revoked and can no longer be used.",
        type: "warning",
      });
      
      fetchBinaryDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to revoke license");
    }
  };

  const handleDeleteLicense = async () => {
    if (!deletingLicense) return;
    try {
      setDeleting(true);
      // First revoke the license if not already revoked
      if (!deletingLicense.revoked) {
        await licenseApi.revoke(deletingLicense.license_id);
      }
      // Then delete it
      await licenseApi.delete(deletingLicense.license_id);
      toast.success("License revoked and deleted successfully!");
      
      await addNotification({
        title: "License Deleted",
        message: "The license has been revoked and permanently deleted.",
        type: "info",
      });
      
      setDeletingLicense(null);
      fetchBinaryDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete license");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteBinary = async () => {
    if (!confirm(`Are you sure you want to delete ${binary?.original_name}? This action cannot be undone.`)) return;

    try {
      await binaryApi.delete(binaryId);
      toast.success("Binary deleted successfully!");
      
      await addNotification({
        title: "Binary Deleted",
        message: `${binary?.original_name} and all associated licenses have been deleted.`,
        type: "warning",
      });
      
      router.push("/files/binaries");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete binary");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusBadge = (license: License) => {
    if (license.revoked) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Revoked</Badge>;
    }
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Expired</Badge>;
    }
    if (license.max_executions && license.executions_used >= license.max_executions) {
      return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Limit Reached</Badge>;
    }
    return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Active</Badge>;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <NavigationLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading binary details...</p>
            </div>
          </div>
        </NavigationLayout>
      </ProtectedRoute>
    );
  }

  if (!binary) {
    return (
      <ProtectedRoute>
        <NavigationLayout>
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Binary Not Found</h3>
            <p className="text-sm text-muted-foreground mt-2">The requested binary does not exist.</p>
            <Link href="/files/binaries">
              <Button className="mt-4">Back to Binaries</Button>
            </Link>
          </div>
        </NavigationLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PageHeader
            title={`${binary.original_name} (${formatBytes(binary.original_size)})`}
            subtitle={binary.description || `Binary ID: ${binary.binary_id}`}
            leading={
              <Link href="/files/binaries">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            }
            actions={
              <Button onClick={handleDeleteBinary} variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Binary
              </Button>
            }
          />

          {/* Licenses Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Licenses</CardTitle>
                  <CardDescription>Manage license keys for this binary</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateLicense(!showCreateLicense)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  {showCreateLicense ? "Cancel" : "Create License"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {showCreateLicense && (
                <form onSubmit={handleCreateLicense} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                  <h3 className="font-semibold text-lg">New License Configuration</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseType" className="text-base font-semibold">License Type *</Label>
                    <select
                      id="licenseType"
                      value={licenseType}
                      onChange={(e) => setLicenseType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="patchable">Patchable - Can update settings later</option>
                      <option value="readonly">Read Only - Immutable, cannot be changed</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {licenseType === "readonly" 
                        ? "⚠️ Read-only licenses are immutable and cannot be modified after creation. All settings are permanently baked in."
                        : "Patchable licenses allow updating dynamic options (grace period, kill count, etc.) after creation."
                      }
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="syncMode">Verification Mode</Label>
                        <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                      </div>
                      <select
                        id="syncMode"
                        value={syncMode ? "sync" : "async"}
                        onChange={(e) => setSyncMode(e.target.value === "sync")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="async">Async - Periodic checks in background</option>
                        <option value="sync">Sync - Check once at startup only</option>
                      </select>
                    </div>

                    {!syncMode && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="checkInterval">Check Interval (ms)</Label>
                        {licenseType === "patchable" && (
                          <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                        )}
                      </div>
                      <Input
                        id="checkInterval"
                        type="number"
                        value={checkInterval}
                        onChange={(e) => setCheckInterval(e.target.value)}
                        placeholder="60000"
                      />
                      <p className="text-xs text-muted-foreground">
                        Time between verification checks (in overload)
                      </p>
                    </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="gracePeriod">Grace Period (seconds)</Label>
                        <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                      </div>
                      <Input
                        id="gracePeriod"
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(e.target.value)}
                        placeholder="Unlimited (leave empty)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Offline tolerance - leave empty for unlimited (in parent binary)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="networkFailureKillCount">Network Failure Tolerance</Label>
                        <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                      </div>
                      <Input
                        id="networkFailureKillCount"
                        type="number"
                        value={networkFailureKillCount}
                        onChange={(e) => setNetworkFailureKillCount(e.target.value)}
                        placeholder="5"
                      />
                      <p className="text-xs text-muted-foreground">
                        Failed checks before killing (in parent binary)
                      </p>
                    </div>                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="maxExecutions">Max Executions (optional)</Label>
                        {licenseType === "patchable" && (
                          <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                        )}
                      </div>
                      <Input
                        id="maxExecutions"
                        type="number"
                        value={maxExecutions}
                        onChange={(e) => setMaxExecutions(e.target.value)}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="expirationDays">Expiration (days, optional)</Label>
                        {licenseType === "patchable" && (
                          <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                        )}
                      </div>
                      <Input
                        id="expirationDays"
                        type="number"
                        value={expirationDays}
                        onChange={(e) => setExpirationDays(e.target.value)}
                        placeholder="Never expires"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="killMethod">Kill Method</Label>
                        {licenseType === "patchable" && (
                          <Badge variant="default" className="text-xs bg-green-600">✏️ Patchable</Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">🔒 Immutable</Badge>
                        )}
                      </div>
                      <select
                        id="killMethod"
                        value={killMethod}
                        onChange={(e) => setKillMethod(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visual:ring-offset-2"
                      >
                        <option value="stop">Stop Binary</option>
                        <option value="delete">Stop and Remove</option>
                        <option value="shred">Stop and Shred</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        How to kill on unauthorized access (in overload)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create License"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCreateLicense(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {licenses.length === 0 && !showCreateLicense ? (
                <div className="text-center py-8 border rounded-lg">
                  <Key className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No licenses created yet</p>
                  <Button 
                    className="mt-4" 
                    size="sm"
                    onClick={() => setShowCreateLicense(true)}
                  >
                    Create First License
                  </Button>
                </div>
              ) : licenses.length > 0 ? (
                <SortableTable
                  data={licenses}
                  columns={[
                    {
                      header: "License ID",
                      accessorKey: "license_id",
                      cell: (license) => (
                        <span className="font-mono text-xs">{license.license_id.substring(0, 16)}...</span>
                      ),
                    },
                    {
                      header: "Type",
                      accessorKey: "license_type",
                      cell: (license) => (
                        <Badge variant={license.license_type === 'readonly' ? 'secondary' : 'default'} className="text-xs">
                          {license.license_type === 'readonly' ? '🔒 Read Only' : '✏️ Patchable'}
                        </Badge>
                      ),
                    },
                    {
                      header: "Status",
                      accessorKey: "revoked",
                      cell: (license) => getStatusBadge(license),
                    },
                    {
                      header: "Executions",
                      accessorKey: "executions_used",
                      cell: (license) => (
                        <>{license.executions_used}{license.max_executions ? ` / ${license.max_executions}` : " / ∞"}</>
                      ),
                    },
                    {
                      header: "Grace Period",
                      accessorKey: "grace_period",
                      cell: (license) => <>{license.grace_period}s</>,
                    },
                    {
                      header: "Created",
                      accessorKey: "created_at",
                      cell: (license) => (
                        <span title={new Date(license.created_at).toLocaleString()}>
                          {formatDistanceToNow(new Date(license.created_at), { addSuffix: true })}
                        </span>
                      ),
                    },
                    {
                      header: "Expires",
                      accessorKey: "expires_at",
                      cell: (license) => (
                        <>{license.expires_at ? new Date(license.expires_at).toLocaleDateString() : "Never"}</>
                      ),
                    },
                    {
                      header: "Actions",
                      accessorKey: "actions",
                      sortable: false,
                      className: "text-right",
                      cell: (license) => (
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const toastId = toast.loading(`Preparing download...`);
                              try {
                                // This triggers browser's native download manager
                                await binaryApi.download(binaryId, license.license_id);
                                toast.success(`Download started: ${binary.original_name}`, { id: toastId });
                              } catch (error) {
                                toast.error("Failed to download", { id: toastId });
                              }
                            }}
                            disabled={license.revoked}
                            title="Download merged binary"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLicense(license);
                            }}
                            disabled={license.revoked}
                            title="Edit license"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!license.revoked ? (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevokeLicense(license.license_id);
                              }}
                              title="Revoke license"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:bg-green-600 hover:text-white"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await licenseApi.update(license.license_id, { revoked: false });
                                  toast.success("License re-enabled successfully!");
                                  fetchBinaryDetails();
                                } catch (error: any) {
                                  toast.error(error.response?.data?.error || "Failed to re-enable license");
                                }
                              }}
                              title="Re-enable license"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingLicense(license);
                            }}
                            title="Delete license"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  onRowClick={(license) => router.push(`/licenses/${license.license_id}`)}
                  emptyMessage="No licenses found"
                />
              ) : null}
            </CardContent>
          </Card>

          {/* Verification Attempts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Verification Attempts</CardTitle>
                  <CardDescription>License verification request history for this binary</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {attemptsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : verificationAttempts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No verification attempts yet</div>
              ) : (
                <>
                  <SortableTable
                    data={verificationAttempts}
                    columns={[
                      {
                        header: "Time",
                        accessorKey: "timestamp",
                        cell: (attempt) => (
                          <span className="font-mono text-xs">
                            {attempt.timestamp ? new Date(attempt.timestamp).toLocaleString() : '-'}
                          </span>
                        ),
                      },
                      {
                        header: "License",
                        accessorKey: "license_id",
                        cell: (attempt) => (
                          <span className="font-mono text-xs">
                            {attempt.license_id ? `${attempt.license_id.substring(0, 12)}...` : '-'}
                          </span>
                        ),
                      },
                      {
                        header: "Machine",
                        accessorKey: "machine_fingerprint",
                        cell: (attempt) => (
                          <span className="font-mono text-xs">
                            {attempt.machine_fingerprint ? `${attempt.machine_fingerprint.substring(0, 12)}...` : '-'}
                          </span>
                        ),
                      },
                      {
                        header: "IP Address",
                        accessorKey: "ip_address",
                        cell: (attempt) => (
                          <span className="text-xs">{attempt.ip_address || '-'}</span>
                        ),
                      },
                      {
                        header: "Status",
                        accessorKey: "success",
                        cell: (attempt) => (
                          attempt.success ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />Failed
                            </Badge>
                          )
                        ),
                      },
                      {
                        header: "Reason",
                        accessorKey: "error_message",
                        cell: (attempt) => (
                          <span className="text-xs text-muted-foreground">
                            {attempt.error_message || '-'}
                          </span>
                        ),
                      },
                    ]}
                    emptyMessage="No verification attempts yet"
                  />
                  {attemptsTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttemptsPage(p => Math.max(1, p - 1))}
                        disabled={attemptsPage === 1 || attemptsLoading}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {attemptsPage} of {attemptsTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttemptsPage(p => Math.min(attemptsTotalPages, p + 1))}
                        disabled={attemptsPage === attemptsTotalPages || attemptsLoading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <EditLicenseDialog 
          license={editingLicense} 
          open={!!editingLicense} 
          onOpenChange={(open) => !open && setEditingLicense(null)} 
          onSuccess={fetchBinaryDetails} 
        />

        {/* Delete License Confirmation Dialog */}
        <Dialog open={!!deletingLicense} onOpenChange={(open) => !open && setDeletingLicense(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete License</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete license{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {deletingLicense?.license_id.substring(0, 16)}...
                </code>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingLicense(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteLicense}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete License"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </NavigationLayout>
    </ProtectedRoute>
  );
}

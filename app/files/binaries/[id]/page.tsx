"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { binaryApi, licenseApi } from "@/lib/api";
import { Binary, License } from "@/types";
import { ArrowLeft, Key, Shield, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/contexts/NotificationContext";
import { EditLicenseDialog } from "@/components/custom/licenses/edit-license-dialog";
import { SortableTable, ColumnDef } from "@/components/sortable-table";
import { Loader } from "@/components/custom/common/loader";
import { EmptyState } from "@/components/custom/common/empty-state";
import { LicenseStatusBadge } from "@/components/custom/licenses/license-status-badge";
import { VerificationAttemptsTable } from "@/components/custom/common/verification-attempts-table";
import { LicenseActionBar } from "@/components/custom/licenses/actions";
import { BinaryDeleteButton } from "@/components/custom/binaries/actions";

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
      console.log("Binary data:", binaryData);
      console.log("Licenses data:", licensesData);
      setBinary(binaryData as any);
      setLicenses(licensesData as any);
    } catch (error) {
      console.error("Error fetching binary details:", error);
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
      console.error("Error fetching verification attempts:", error);
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
      toast.success(`Download started: ${binary.original_name}`, {
        id: toastId,
      });
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
      console.error("License creation error:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to create license"
      );
    } finally {
      setCreating(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <NavigationLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader text="Loading binary details..." />
          </div>
        </NavigationLayout>
      </ProtectedRoute>
    );
  }

  if (!binary) {
    return (
      <ProtectedRoute>
        <NavigationLayout>
          <EmptyState
            icon={Shield}
            title="Binary Not Found"
            description="The requested binary does not exist."
            action={{
              label: "Back to Binaries",
              onClick: () => router.push("/files/binaries"),
            }}
          />
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
            title={`${binary.original_name} (${formatBytes(
              binary.original_size
            )})`}
            subtitle={binary.description || `Binary ID: ${binary.binary_id}`}
            leading={
              <Link href="/files/binaries">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            }
            actions={
              <BinaryDeleteButton
                binaryId={binaryId}
                binaryName={binary.original_name}
                onSuccess={() => router.push("/files/binaries")}
                variant="button"
              />
            }
          />

          {/* Licenses Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Licenses</CardTitle>
                  <CardDescription>
                    Manage license keys for this binary
                  </CardDescription>
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
                <form
                  onSubmit={handleCreateLicense}
                  className="border rounded-lg p-4 space-y-4 bg-muted/20"
                >
                  <h3 className="font-semibold text-lg">
                    New License Configuration
                  </h3>

                  <div className="space-y-2">
                    <Label
                      htmlFor="licenseType"
                      className="text-base font-semibold"
                    >
                      License Type *
                    </Label>
                    <select
                      id="licenseType"
                      value={licenseType}
                      onChange={(e) => setLicenseType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="patchable">
                        Patchable - Can update settings later
                      </option>
                      <option value="readonly">
                        Read Only - Immutable, cannot be changed
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {licenseType === "readonly"
                        ? "⚠️ Read-only licenses are immutable and cannot be modified after creation. All settings are permanently baked in."
                        : "Patchable licenses allow updating dynamic options (grace period, kill count, etc.) after creation."}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="syncMode">Verification Mode</Label>
                        <Badge variant="secondary" className="text-xs">
                          🔒 Immutable
                        </Badge>
                      </div>
                      <select
                        id="syncMode"
                        value={syncMode ? "sync" : "async"}
                        onChange={(e) => setSyncMode(e.target.value === "sync")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="async">
                          Async - Periodic checks in background
                        </option>
                        <option value="sync">
                          Sync - Check once at startup only
                        </option>
                      </select>
                    </div>
                    {!syncMode && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="checkInterval">
                            Check Interval (ms)
                          </Label>
                          {licenseType === "patchable" && (
                            <Badge
                              variant="default"
                              className="text-xs bg-green-600"
                            >
                              ✏️ Patchable
                            </Badge>
                          )}
                          {licenseType === "readonly" && (
                            <Badge variant="secondary" className="text-xs">
                              🔒 Immutable
                            </Badge>
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
                        <Label htmlFor="gracePeriod">
                          Grace Period (seconds)
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          🔒 Immutable
                        </Badge>
                      </div>
                      <Input
                        id="gracePeriod"
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(e.target.value)}
                        placeholder="Unlimited (leave empty)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Offline tolerance - leave empty for unlimited (in parent
                        binary)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="networkFailureKillCount">
                          Network Failure Tolerance
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          🔒 Immutable
                        </Badge>
                      </div>
                      <Input
                        id="networkFailureKillCount"
                        type="number"
                        value={networkFailureKillCount}
                        onChange={(e) =>
                          setNetworkFailureKillCount(e.target.value)
                        }
                        placeholder="5"
                      />
                      <p className="text-xs text-muted-foreground">
                        Failed checks before killing (in parent binary)
                      </p>
                    </div>{" "}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="maxExecutions">
                          Max Executions (optional)
                        </Label>
                        {licenseType === "patchable" && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            ✏️ Patchable
                          </Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">
                            🔒 Immutable
                          </Badge>
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
                        <Label htmlFor="expirationDays">
                          Expiration (days, optional)
                        </Label>
                        {licenseType === "patchable" && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            ✏️ Patchable
                          </Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">
                            🔒 Immutable
                          </Badge>
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
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            ✏️ Patchable
                          </Badge>
                        )}
                        {licenseType === "readonly" && (
                          <Badge variant="secondary" className="text-xs">
                            🔒 Immutable
                          </Badge>
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
                <div className="border rounded-lg">
                  <EmptyState
                    icon={Key}
                    title="No licenses created yet"
                    description="Create your first license to start protecting this binary"
                    action={{
                      label: "Create First License",
                      onClick: () => setShowCreateLicense(true),
                    }}
                    className="py-8"
                  />
                </div>
              ) : licenses.length > 0 ? (
                <SortableTable
                  data={licenses}
                  columns={[
                    {
                      header: "License ID",
                      accessorKey: "license_id",
                      cell: (license) => (
                        <span className="font-mono text-xs">
                          {license.license_id.substring(0, 16)}...
                        </span>
                      ),
                    },
                    {
                      header: "Type",
                      accessorKey: "license_type",
                      cell: (license) => (
                        <Badge
                          variant={
                            license.license_type === "readonly"
                              ? "secondary"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {license.license_type === "readonly"
                            ? "🔒 Read Only"
                            : "✏️ Patchable"}
                        </Badge>
                      ),
                    },
                    {
                      header: "Status",
                      accessorKey: "revoked",
                      cell: (license) => (
                        <LicenseStatusBadge
                          revoked={license.revoked}
                          expires_at={license.expires_at}
                          max_executions={license.max_executions}
                          executions_used={license.executions_used}
                        />
                      ),
                    },
                    {
                      header: "Executions",
                      accessorKey: "executions_used",
                      cell: (license) => (
                        <>
                          {license.executions_used}
                          {license.max_executions
                            ? ` / ${license.max_executions}`
                            : " / ∞"}
                        </>
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
                        <span
                          title={new Date(license.created_at).toLocaleString()}
                        >
                          {formatDistanceToNow(new Date(license.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      ),
                    },
                    {
                      header: "Expires",
                      accessorKey: "expires_at",
                      cell: (license) => (
                        <>
                          {license.expires_at
                            ? new Date(license.expires_at).toLocaleDateString()
                            : "Never"}
                        </>
                      ),
                    },
                    {
                      header: "Actions",
                      accessorKey: "actions",
                      sortable: false,
                      className: "text-right",
                      cell: (license) => (
                        <LicenseActionBar
                          license={license}
                          binaryId={binaryId}
                          onSuccess={fetchBinaryDetails}
                        />
                      ),
                    },
                  ]}
                  onRowClick={(license) =>
                    router.push(`/licenses/${license.license_id}`)
                  }
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
                  <CardDescription>
                    License verification request history for this binary
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <VerificationAttemptsTable
                attempts={verificationAttempts}
                loading={attemptsLoading}
                page={attemptsPage}
                totalPages={attemptsTotalPages}
                onPageChange={setAttemptsPage}
              />
            </CardContent>
          </Card>
        </motion.div>

        <EditLicenseDialog
          license={editingLicense}
          open={!!editingLicense}
          onOpenChange={(open) => !open && setEditingLicense(null)}
          onSuccess={fetchBinaryDetails}
        />
      </NavigationLayout>
    </ProtectedRoute>
  );
}

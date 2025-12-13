"use client";

import { useState, useEffect } from "react";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { licenseApi, binaryApi } from "@/lib/api";
import { Key, RefreshCw, Search, ChevronLeft, ChevronRight, Trash2, Download, Edit, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { EditLicenseDialog } from "@/components/edit-license-dialog";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
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

interface LicenseListItem {
  license_id: string;
  binary_id: string;
  binary_name: string;
  license_type: string;
  sync_mode: boolean;
  created_at: string;
  expires_at: string | null;
  max_executions: number | null;
  executions_used: number;
  revoked: boolean;
  unique_computers: number;
  verification_count: number;
  size?: number;
}

import { formatBytes } from "@/lib/utils";

export default function LicensesPage() {
  const router = useRouter();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState({ title: "", description: "" });
  const { addNotification } = useNotifications();
  const [licenses, setLicenses] = useState<LicenseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deletingLicense, setDeletingLicense] = useState<LicenseListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingLicense, setEditingLicense] = useState<LicenseListItem | null>(null);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await licenseApi.listAll({
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setLicenses(response.licenses as any);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (error: any) {
      console.error("Failed to fetch licenses:", error);
      toast.error(error.response?.data?.message || "Failed to load licenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchLicenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
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
      
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to revoke license");
    }
  };

  const handleReEnableLicense = async (licenseId: string) => {
    try {
      await licenseApi.update(licenseId, { revoked: false });
      toast.success("License re-enabled successfully!");
      
      await addNotification({
        title: "License Re-enabled",
        message: "The license has been re-enabled and can be used again.",
        type: "success",
      });
      
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to re-enable license");
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
      fetchLicenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete license");
    } finally {
      setDeleting(false);
    }
  };



  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <PageHeader
            title="All Licenses"
            subtitle="Manage and monitor all licenses"
            actions={
              <Button onClick={fetchLicenses} disabled={loading} size="sm" variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Licenses ({total})
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search licenses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : licenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No licenses found
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("license_id")}
                        >
                          License ID{getSortIcon("license_id")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("binary_name")}
                        >
                          Binary{getSortIcon("binary_name")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("type")}
                        >
                          Type{getSortIcon("type")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("computers")}
                        >
                          Computers{getSortIcon("computers")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("verifications")}
                        >
                          Verifications{getSortIcon("verifications")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("executions")}
                        >
                          Executions{getSortIcon("executions")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("created")}
                        >
                          Created{getSortIcon("created")}
                        </TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licenses.map((license) => (
                        <TableRow 
                          key={license.license_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/licenses/${license.license_id}`)}
                        >
                          <TableCell className="font-mono text-xs">
                            {license.license_id.substring(0, 16)}...
                          </TableCell>
                          <TableCell className="font-medium">
                            {license.binary_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={license.license_type === 'readonly' ? 'secondary' : 'default'} className="text-xs">
                              {license.license_type === 'readonly' ? '🔒 Read Only' : '✏️ Patchable'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{license.unique_computers}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{license.verification_count}</Badge>
                          </TableCell>
                          <TableCell>
                            {license.executions_used}
                            {license.max_executions ? ` / ${license.max_executions}` : " / ∞"}
                          </TableCell>
                          <TableCell>
                            <span title={new Date(license.created_at).toLocaleString()}>
                              {formatDistanceToNow(new Date(license.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {license.size ? formatBytes(license.size) : "-"}
                          </TableCell>
                          <TableCell className="text-right cursor-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const toastId = toast.loading(`Preparing download...`);
                                  try {
                                    // This triggers browser's native download manager
                                    await binaryApi.download(license.binary_id, license.license_id);
                                    toast.success(`Download started`, { id: toastId });
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
                                }}
                                disabled={license.revoked}
                                title="Download merged binary"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
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
                                  className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
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
                                  className="h-8 w-8 text-green-600 hover:bg-green-600 hover:text-white cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReEnableLicense(license.license_id);
                                  }}
                                  title="Re-enable license"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingLicense(license);
                                }}
                                title="Delete license"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, total)} of {total} licenses
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1 || loading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages || loading}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit License Dialog */}
        <EditLicenseDialog
          license={editingLicense ? {
            license_id: editingLicense.license_id,
            license_type: editingLicense.license_type,
            kill_method: 'stop',
            max_executions: editingLicense.max_executions || undefined,
            expires_at: editingLicense.expires_at || undefined,
          } : null}
          open={!!editingLicense}
          onOpenChange={(open) => !open && setEditingLicense(null)}
          onSuccess={() => {
            setEditingLicense(null);
            fetchLicenses();
          }}
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
      </NavigationLayout>
    </ProtectedRoute>
  );
}

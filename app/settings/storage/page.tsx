"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  HardDrive,
  Trash2,
  RefreshCw,
  FileCode2,
  Key,
  Database,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  settingsApi,
  StorageStats,
  CleanupRecommendations,
  StorageItem,
} from "@/lib/api/settings";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatBytes } from "@/lib/utils";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import Link from "next/link";
import { binaryApi, licenseApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SegmentedProgressBar = ({
  originalSize,
  mergedSize,
  totalQuota,
}: {
  originalSize: number;
  mergedSize: number;
  totalQuota: number;
}) => {
  const originalPercent = (originalSize / totalQuota) * 100;
  const mergedPercent = (mergedSize / totalQuota) * 100;

  return (
    <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden flex">
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{ width: `${originalPercent}%` }}
        title={`Binaries: ${originalPercent.toFixed(1)}%`}
      />
      <div
        className="h-full bg-secondary transition-all duration-500"
        style={{ width: `${mergedPercent}%` }}
        title={`Licenses: ${mergedPercent.toFixed(1)}%`}
      />
    </div>
  );
};

const StorageList = ({
  title,
  items,
  type,
  onDelete,
}: {
  title: string;
  items: StorageItem[];
  type: "binaries" | "licenses";
  onDelete: (id: string) => Promise<void>;
}) => {
  const [sort, setSort] = useState("largest");

  const sortedItems = [...items].sort((a, b) => {
    if (sort === "largest") {
      return b.size - a.size;
    } else {
      // Unused Max Days (Oldest activity first)
      // If last_active is null (never used), treat as very old (0 timestamp)
      const timeA = a.last_active ? new Date(a.last_active).getTime() : 0;
      const timeB = b.last_active ? new Date(b.last_active).getTime() : 0;
      return timeA - timeB;
    }
  });

  // Limit to top 10 for display
  const displayItems = sortedItems.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>Manage your {type}</CardDescription>
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="largest">Largest Size</SelectItem>
            <SelectItem value="unused">Unused Max Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        {!displayItems.length ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No {type} found
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 group hover:bg-muted/50 transition-colors"
              >
                <Link 
                  href={`/${type}/${item.id}`}
                  className="flex-1 flex items-center justify-between mr-4 min-w-0"
                >
                  <div className="truncate max-w-[200px]">
                    <div
                      className="font-medium text-sm truncate group-hover:text-primary transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.last_active
                        ? `Last active: ${new Date(
                            item.last_active
                          ).toLocaleDateString()}`
                        : "Never used"}
                    </div>
                  </div>
                  <div className="text-sm font-mono">
                    {formatBytes(item.size)}
                  </div>
                </Link>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {type === 'binaries' ? 'Binary' : 'License'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
            <div className="text-center pt-2">
              <Link
                href={`/${type}`}
                className="text-xs text-primary hover:underline"
              >
                View all {type}
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [recommendations, setRecommendations] =
    useState<CleanupRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  const [deleteLicensesOpen, setDeleteLicensesOpen] = useState(false);
  const [deleteLicensesConfirmText, setDeleteLicensesConfirmText] = useState("");

  const [deleteEverythingOpen, setDeleteEverythingOpen] = useState(false);
  const [deleteEverythingConfirmText, setDeleteEverythingConfirmText] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsData, recommendationsData] = await Promise.all([
        settingsApi.getStorageStats(),
        settingsApi.getCleanupRecommendations(),
      ]);
      setStats(statsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
      toast.error("Failed to load storage data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteBinary = async (id: string) => {
    try {
      await binaryApi.delete(id);
      toast.success("Binary deleted successfully");
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete binary");
    }
  };

  const handleDeleteLicense = async (id: string) => {
    try {
      await licenseApi.delete(id);
      toast.success("License deleted successfully");
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete license");
    }
  };

  const handleDeleteAllLicenses = async () => {
    try {
      setCleaning(true);
      const result = await settingsApi.deleteAllLicenses();
      toast.success(
        `Deleted all licenses. Freed ${formatBytes(result.freed_bytes)}.`
      );
      fetchStats();
      setDeleteLicensesOpen(false);
    } catch (error) {
      toast.error("Failed to delete licenses");
    } finally {
      setCleaning(false);
      setDeleteLicensesConfirmText("");
    }
  };

  const handleDeleteAllBinaries = async () => {
    try {
      setCleaning(true);
      const result = await settingsApi.deleteAllBinaries();
      toast.success(
        `Deleted all binaries. Freed ${formatBytes(result.freed_bytes)}.`
      );
      fetchStats();
      setDeleteEverythingOpen(false);
    } catch (error) {
      toast.error("Failed to delete binaries");
    } finally {
      setCleaning(false);
      setDeleteEverythingConfirmText("");
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Storage Management
              </h1>
              <p className="text-muted-foreground">
                Manage your storage usage and clean up old files.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Storage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                Storage Usage
              </CardTitle>
              <CardDescription>
                You are using {formatBytes(stats?.storage_used || 0)} of{" "}
                {formatBytes(stats?.storage_quota || 0)} free quota.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used Space</span>
                  <span className="font-medium">
                    {stats?.usage_percentage.toFixed(1)}%
                  </span>
                </div>
                
                <SegmentedProgressBar 
                  originalSize={stats?.files.original_binaries || 0}
                  mergedSize={stats?.files.merged_binaries || 0}
                  totalQuota={stats?.storage_quota || 1}
                />

                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>
                      Binaries (
                      {formatBytes(stats?.files.original_binaries || 0)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span>
                      Merged Licenses (
                      {formatBytes(stats?.files.merged_binaries || 0)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50 flex flex-col items-center justify-center text-center">
                  <FileCode2 className="h-8 w-8 text-primary mb-2 opacity-80" />
                  <div className="text-2xl font-bold">
                    {stats?.binaries_count}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Binaries
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50 flex flex-col items-center justify-center text-center">
                  <Key className="h-8 w-8 text-secondary mb-2 opacity-80" />
                  <div className="text-2xl font-bold">
                    {stats?.licenses_count}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Licenses
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/50 flex flex-col items-center justify-center text-center">
                  <Database className="h-8 w-8 text-accent mb-2 opacity-80" />
                  <div className="text-2xl font-bold">
                    {formatBytes(stats?.storage_used || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Size
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cleanup Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StorageList 
              title="Binaries" 
              items={recommendations?.binaries || []} 
              type="binaries"
              onDelete={handleDeleteBinary}
            />
            <StorageList 
              title="Licenses" 
              items={recommendations?.licenses || []} 
              type="licenses"
              onDelete={handleDeleteLicense}
            />
          </div>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions to clear your data and free up space.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-background/50">
                <div>
                  <h3 className="font-medium">Delete All Licenses</h3>
                  <p className="text-sm text-muted-foreground">
                    Removes all licenses and their associated merged binaries.
                    Original binaries are kept.
                  </p>
                  {stats && stats.files.merged_binaries > 0 && (
                    <p className="text-sm font-medium text-destructive mt-1">
                      Will free approximately {formatBytes(stats.files.merged_binaries)}
                    </p>
                  )}
                </div>
                <Dialog open={deleteLicensesOpen} onOpenChange={setDeleteLicensesOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={cleaning}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Licenses
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Are you absolutely sure?
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete all your licenses and their associated merged
                        binaries.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="confirm-licenses">
                        Type <span className="font-bold">Delete Licenses</span> to confirm
                      </Label>
                      <Input
                        id="confirm-licenses"
                        value={deleteLicensesConfirmText}
                        onChange={(e) => setDeleteLicensesConfirmText(e.target.value)}
                        placeholder="Delete Licenses"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteLicensesOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAllLicenses}
                        disabled={deleteLicensesConfirmText !== "Delete Licenses" || cleaning}
                      >
                        {cleaning ? "Deleting..." : "Yes, delete all licenses"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-background/50">
                <div>
                  <h3 className="font-medium">Delete Everything</h3>
                  <p className="text-sm text-muted-foreground">
                    Removes ALL binaries and licenses. Your account will be
                    completely reset.
                  </p>
                  {stats && stats.storage_used > 0 && (
                    <p className="text-sm font-medium text-destructive mt-1">
                      Will free approximately {formatBytes(stats.storage_used)}
                    </p>
                  )}
                </div>
                <Dialog open={deleteEverythingOpen} onOpenChange={setDeleteEverythingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={cleaning}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Everything
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Are you absolutely sure?
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete ALL your uploaded binaries and created licenses.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="confirm-everything">
                        Type <span className="font-bold">Delete Everything</span> to confirm
                      </Label>
                      <Input
                        id="confirm-everything"
                        value={deleteEverythingConfirmText}
                        onChange={(e) => setDeleteEverythingConfirmText(e.target.value)}
                        placeholder="Delete Everything"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteEverythingOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAllBinaries}
                        disabled={deleteEverythingConfirmText !== "Delete Everything" || cleaning}
                      >
                        {cleaning ? "Deleting..." : "Yes, delete everything"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}

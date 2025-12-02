"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { binaryApi } from "@/lib/api";
import { Binary } from "@/types";
import { FileCode2, Download, Key, RefreshCw, Search, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BinariesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [binaries, setBinaries] = useState<Binary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchBinaries = async () => {
    try {
      setLoading(true);
      const response = await binaryApi.list({
        search: searchQuery,
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setBinaries(response.binaries as any);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (error) {
      toast.error("Failed to fetch binaries");
      setBinaries([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate items per page based on window height
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const windowHeight = window.innerHeight;
      // Estimate: ~60px per row, subtract ~400px for header/footer/padding
      const availableHeight = windowHeight - 400;
      const rowHeight = 60;
      const calculated = Math.floor(availableHeight / rowHeight);
      // Min 10, max 100
      const bounded = Math.max(10, Math.min(100, calculated));
      setItemsPerPage(bounded);
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

    const handleDownload = async (binary: Binary) => {
    const toastId = toast.loading(`Downloading ${binary.original_name}...`);
    try {
      const blob = await binaryApi.download(binary.binary_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = binary.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${binary.original_name}`, { id: toastId });
    } catch (error) {
      toast.error("Failed to download binary", { id: toastId });
    }
  };

  const handleDelete = async (binary: Binary) => {
    if (!confirm(`Are you sure you want to delete ${binary.original_name}?`)) return;
    
    try {
      await binaryApi.delete(binary.binary_id);
      toast.success("Binary deleted successfully!");
      
      await addNotification({
        title: "Binary Deleted",
        message: `${binary.original_name} has been deleted.`,
        type: "warning",
      });
      
      fetchBinaries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete binary");
    }
  };

  useEffect(() => {
    fetchBinaries();
  }, [currentPage, itemsPerPage, sortBy, sortOrder]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      fetchBinaries();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

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

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <PageHeader
            title="Binaries"
            subtitle="Manage your protected binary files"
            leading={
              <Link href="/files">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            }
            actions={
              <>
                <Button onClick={fetchBinaries} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Link href="/upload">
                  <Button size="sm" className="gap-2">
                    <FileCode2 className="h-4 w-4" />
                    Upload Binary
                  </Button>
                </Link>
              </>
            }
          />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search binaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading binaries...</p>
                </div>
              ) : binaries.length === 0 ? (
                <div className="text-center py-8">
                  <FileCode2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No binaries found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "Upload your first binary to get started"}
                  </p>
                  {!searchQuery && (
                    <Link href="/upload">
                      <Button className="mt-4" size="sm">
                        Upload Binary
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("name")}
                        >
                          Filename{getSortIcon("name")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("size")}
                        >
                          Size{getSortIcon("size")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("licenses")}
                        >
                          Total Licenses{getSortIcon("licenses")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("created")}
                        >
                          Uploaded{getSortIcon("created")}
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {binaries.map((binary) => (
                      <TableRow 
                        key={binary.binary_id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/files/binaries/${binary.binary_id}`)}
                      >
                        <TableCell className="font-medium">{binary.original_name}</TableCell>
                        <TableCell>{formatBytes(binary.original_size)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{binary.license_count || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <span title={new Date(binary.created_at).toLocaleString()}>
                            {formatDistanceToNow(new Date(binary.created_at), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <TooltipProvider>
                            <div className="flex justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/files/binaries/${binary.binary_id}`);
                                    }}
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Manage Licenses</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(binary);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} binaries
                    </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
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
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
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
      </NavigationLayout>
    </ProtectedRoute>
  );
}

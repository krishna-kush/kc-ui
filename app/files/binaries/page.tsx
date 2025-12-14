"use client";

import { useState, useEffect } from "react";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { ResourceList } from "@/components/custom/common/resource-list";
import { SearchInput } from "@/components/custom/common/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
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
import { FileCode2, Key, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BinaryDeleteButton } from "@/components/custom/binaries/actions";

export default function BinariesPage() {
  const router = useRouter();
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
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

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
                <Button
                  onClick={fetchBinaries}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
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

          <ResourceList
            title="Binaries"
            totalItems={total}
            icon={FileCode2}
            loading={loading}
            items={binaries}
            searchControl={
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search binaries..."
                className="max-w-sm"
              />
            }
            emptyState={{
              title: "No binaries found",
              description: "Upload a binary to get started",
              action: {
                label: "Upload Binary",
                onClick: () => router.push("/upload"),
              },
            }}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
              itemsPerPage,
              itemName: "binaries",
            }}
          >
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
                    onClick={() =>
                      router.push(`/files/binaries/${binary.binary_id}`)
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="h-4 w-4 text-muted-foreground" />
                        {binary.original_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatBytes(binary.original_size)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {binary.license_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(binary.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                                  router.push(
                                    `/files/binaries/${binary.binary_id}`
                                  );
                                }}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage Licenses</p>
                            </TooltipContent>
                          </Tooltip>

                          <BinaryDeleteButton
                            binaryId={binary.binary_id}
                            binaryName={binary.original_name}
                            onSuccess={fetchBinaries}
                          />
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResourceList>
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}

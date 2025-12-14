"use client";

import { useState, useEffect } from "react";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
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
import { licenseApi } from "@/lib/api";
import { Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ResourceList } from "@/components/custom/common/resource-list";
import { SearchInput } from "@/components/custom/common/search-input";
import { LicenseActionBar } from "@/components/custom/licenses/actions";
import { formatBytes } from "@/lib/utils";

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

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<LicenseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <PageHeader
            title="All Licenses"
            subtitle="Manage and monitor all licenses"
            actions={
              <Button
                onClick={fetchLicenses}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            }
          />

          <ResourceList
            title="Licenses"
            totalItems={total}
            icon={Key}
            loading={loading}
            items={licenses}
            searchControl={
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search licenses..."
                className="w-64"
              />
            }
            emptyState={{
              title: "No licenses found",
              description: "Create a new license to get started",
            }}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
              itemsPerPage,
              itemName: "licenses",
            }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("created")}
                  >
                    Created{getSortIcon("created")}
                  </TableHead>
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
                    onClick={() => toggleSort("status")}
                  >
                    Status{getSortIcon("status")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("executions")}
                  >
                    Usage{getSortIcon("executions")}
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
                    onClick={() =>
                      router.push(`/licenses/${license.license_id}`)
                    }
                  >
                    <TableCell className="font-mono text-xs">
                      {formatDistanceToNow(new Date(license.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {license.license_id.substring(0, 16)}...
                    </TableCell>
                    <TableCell>{license.binary_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {license.license_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={license.revoked ? "destructive" : "default"}
                      >
                        {license.revoked ? "Revoked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {license.executions_used} /{" "}
                          {license.max_executions || "∞"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {license.size ? formatBytes(license.size) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <LicenseActionBar
                        license={license}
                        onSuccess={fetchLicenses}
                      />
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

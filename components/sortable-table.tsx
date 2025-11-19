"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  accessorKey: string;
  sortable?: boolean;
  cell?: (row: T) => ReactNode;
  className?: string;
}

interface SortableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);
  // Pagination props
  enablePagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  // Sorting props (controlled)
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  // Loading state
  loading?: boolean;
  emptyMessage?: string;
}

export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  rowClassName,
  enablePagination = false,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  total = 0,
  onPageChange,
  sortBy,
  sortOrder = "desc",
  onSortChange,
  loading = false,
  emptyMessage = "No data available",
}: SortableTableProps<T>) {
  const [localSortBy, setLocalSortBy] = useState<string | null>(null);
  const [localSortOrder, setLocalSortOrder] = useState<"asc" | "desc">("desc");

  // Use controlled or uncontrolled sorting
  const activeSortBy = sortBy !== undefined ? sortBy : localSortBy;
  const activeSortOrder = sortBy !== undefined ? sortOrder : localSortOrder;

  const handleSort = (columnKey: string) => {
    if (onSortChange) {
      // Controlled mode
      const newOrder = activeSortBy === columnKey && activeSortOrder === "desc" ? "asc" : "desc";
      onSortChange(columnKey, newOrder);
    } else {
      // Uncontrolled mode
      if (localSortBy === columnKey) {
        setLocalSortOrder(localSortOrder === "asc" ? "desc" : "asc");
      } else {
        setLocalSortBy(columnKey);
        setLocalSortOrder("desc");
      }
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (activeSortBy !== columnKey) return null;
    return activeSortOrder === "asc" ? " ↑" : " ↓";
  };

  // Client-side sorting if uncontrolled
  const sortedData = !onSortChange && localSortBy
    ? [...data].sort((a, b) => {
        const aVal = a[localSortBy];
        const bVal = b[localSortBy];
        
        if (aVal === bVal) return 0;
        const comparison = aVal > bVal ? 1 : -1;
        return localSortOrder === "asc" ? comparison : -comparison;
      })
    : data;

  const getRowClassName = (row: T) => {
    const baseClass = "cursor-pointer hover:bg-muted/50";
    if (typeof rowClassName === "function") {
      return `${baseClass} ${rowClassName(row)}`;
    }
    return `${baseClass} ${rowClassName || ""}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.accessorKey}
                className={`${
                  column.sortable !== false
                    ? "cursor-pointer hover:bg-muted/50"
                    : ""
                } ${column.className || ""}`}
                onClick={() =>
                  column.sortable !== false && handleSort(column.accessorKey)
                }
              >
                {column.header}
                {column.sortable !== false && getSortIcon(column.accessorKey)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow
              key={index}
              className={onRowClick ? getRowClassName(row) : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.accessorKey}
                  className={column.className}
                  onClick={(e) => {
                    // Allow cell-level click handlers to stop propagation
                    if ((e.target as HTMLElement).closest("button")) {
                      e.stopPropagation();
                    }
                  }}
                >
                  {column.cell
                    ? column.cell(row)
                    : row[column.accessorKey]?.toString() || "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
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
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

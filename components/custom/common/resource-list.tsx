import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/custom/common/loader";
import { EmptyState } from "@/components/custom/common/empty-state";
import { Pagination } from "@/components/custom/common/pagination";
import { LucideIcon } from "lucide-react";

interface ResourceListProps<T> {
  title?: string;
  totalItems?: number;
  icon?: LucideIcon;
  searchControl?: React.ReactNode;
  loading: boolean;
  items: T[];
  emptyState: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  children: React.ReactNode; // The table or list content
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    itemName?: string;
  };
  className?: string;
}

export function ResourceList<T>({
  title,
  totalItems,
  icon: Icon,
  searchControl,
  loading,
  items,
  emptyState,
  children,
  pagination,
  className,
}: ResourceListProps<T>) {
  return (
    <Card className={className}>
      {(title || searchControl) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && (
              <CardTitle className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5" />}
                {title} {totalItems !== undefined && `(${totalItems})`}
              </CardTitle>
            )}
            {searchControl}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader text="Loading..." />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={emptyState.icon}
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
            className="py-8 text-muted-foreground"
          />
        ) : (
          <div className="space-y-4">
            {children}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                totalItems={totalItems}
                itemsPerPage={pagination.itemsPerPage}
                itemName={pagination.itemName}
                loading={loading}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

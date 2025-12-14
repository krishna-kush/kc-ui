import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseId: string | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteLicenseDialog({
  open,
  onOpenChange,
  licenseId,
  onConfirm,
  isDeleting,
}: DeleteLicenseDialogProps) {
  if (!licenseId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete License</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete license{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {licenseId.substring(0, 16)}...
            </code>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete License"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

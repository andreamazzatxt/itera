"use client";
import { createRoot } from "react-dom/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

function ConfirmModal({
  open,
  options,
  onClose,
}: {
  open: boolean;
  options: ConfirmOptions;
  onClose: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-md" glass>
        <DialogHeader>
          <DialogTitle>{options.title || "Are You Sure?"}</DialogTitle>
          <DialogDescription className="text-muted font-light">
            {options.description || "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onClose(false)}>
            {options.cancelText || "Cancel"}
          </Button>
          <Button onClick={() => onClose(true)}>
            {options.confirmText || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function confirmModal(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    const handleClose = (value: boolean) => {
      root.unmount();
      div.remove();
      resolve(value);
    };

    root.render(
      <ConfirmModal open={true} options={options} onClose={handleClose} />
    );
  });
}

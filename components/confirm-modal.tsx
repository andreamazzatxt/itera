"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { createRoot } from "react-dom/client";

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
  const t = useTranslations("Common");
  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-md" glass>
        <DialogHeader>
          <DialogTitle>{options.title || t("are-you-sure")}</DialogTitle>
          <DialogDescription className="text-muted font-light">
            {options.description || t("this-action-cannot-be-undone")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onClose(false)}>
            {options.cancelText || t("cancel")}
          </Button>
          <Button onClick={() => onClose(true)}>
            {options.confirmText || t("confirm")}
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

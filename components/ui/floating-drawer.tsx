import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { X } from "lucide-react";

type FloatingDrawerProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  glass?: boolean;
};

export function FloatingDrawer({
  open,
  onClose,
  children,
  className,
  glass = false,
}: FloatingDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center px-4 py-4 pointer-events-none"
        >
          {/* Card drawer */}
          <motion.div
            layout
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className={cn(
              glass
                ? "bg-gray-500 bg-clip-padding backdrop-filter  backdrop-blur-2xl bg-opacity-50 backdrop-saturate-100 backdrop-contrast-100 text-white font-semibold"
                : "bg-white",
              "relative z-10  rounded-2xl shadow-xl w-full p-4 overflow-hidden pointer-events-auto",
              className
            )}
            style={{ margin: 24 }}
          >
            {onClose && (
              <button onClick={onClose} className="absolute top-2 right-2">
                <X />
              </button>
            )}

            <div className="space-y-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

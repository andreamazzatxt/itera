import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize, Minimize, X } from "lucide-react";
import { ReactNode } from "react";

type FloatingDrawerProps = {
  open: boolean;
  onClose?: () => void;
  onChangeDimensions?: () => void;
  isMinimized?: boolean;
  children: ReactNode;
  className?: string;
  glass?: boolean;
};

export function FloatingDrawer({
  open,
  onClose,
  onChangeDimensions,
  isMinimized,
  children,
  className,
  glass = false,
}: FloatingDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-6 pb-12 sm:p-12 pointer-events-none"
        >
          {/* Card drawer */}
          <motion.div
            layout
            initial={{ y: "100%" }}
            animate={{ y: 1 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.4 }}
            className={cn(
              glass
                ? "bg-gray-500 bg-clip-padding backdrop-filter  backdrop-blur-2xl bg-opacity-50 backdrop-saturate-100 backdrop-contrast-100 text-white font-semibold"
                : "bg-white",
              "relative z-10  rounded-2xl shadow-xl w-full p-6 overflow-hidden pointer-events-auto",
              className
            )}
          >
            <div className="absolute top-2 right-2 flex gap-1">
              {onChangeDimensions && (
                <button onClick={onChangeDimensions}>
                  {isMinimized ? <Maximize /> : <Minimize />}
                </button>
              )}
              {onClose && (
                <button onClick={onClose}>
                  <X />
                </button>
              )}
            </div>

            <div className="space-y-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { createContext, useContext, useState, ReactNode } from "react";

export enum DRAWER {
  TRACKS = "tracks",
  TIME = "time",
}

type DrawerContextType = {
  openDrawer: DRAWER | null;
  open: (id: DRAWER) => void;
  close: () => void;
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [openDrawer, setOpenDrawer] = useState<DRAWER | null>(null);

  const open = (id: DRAWER) => setOpenDrawer(id);
  const close = () => setOpenDrawer(null);

  return (
    <DrawerContext.Provider value={{ openDrawer, open, close }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);

  const isOpen = context?.openDrawer !== null;

  if (!context)
    throw new Error("useDrawer must be used within a DrawerProvider");
  return { ...context, isOpen };
}

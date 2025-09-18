"use client";

import { DialogTrigger } from "@radix-ui/react-dialog";
import { Cookie, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { version } from "../package.json";
import { useTranslations } from "next-intl";

export interface TrackConfig {
  name: string;
  color: string;
}

export function InfoModal() {
  const t = useTranslations("InfoModal");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md z-[9999]" glass>
        <DialogHeader>
          <DialogTitle>
            Itera <span className="text-xs">v{version}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm font-light">
          {t("description.line1")}
          <br />
          {t.rich("description.line2", {
            instaLink: (children) => (
              <a
                href="https://www.instagram.com/olivia_and_joseph/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {children}
              </a>
            ),
          })}{" "}
          <br />
          <br />
          {t("description.line3")}
          <br />
          <br />
          Made with <span className="text-red-500">♥</span> by{" "}
          <a
            href="https://andreamz.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            andreamz
          </a>
          <br />
          <br />
          <Cookie className="inline mb-1 mr-1 h-4 w-4" />
          <span className="text-xs font-thin">{t("privacy")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { DialogTrigger } from "@radix-ui/react-dialog";
import { Cookie, Info, PawPrint } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { version } from "../package.json";

export interface TrackConfig {
  name: string;
  color: string;
}

export function InfoModal() {
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
          One day, during our usual walk in the woods,
          <br />
          <a
            href="https://www.instagram.com/thejolivias/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Olivia and Joseph
          </a>{" "}
          got stuck in an electric fence and spent the whole night outside. I
          was extremely worried, but luckily they are both fine. Their GPS app
          is great, but it didn’t allow me to compare their tracks on the same
          map. That experience motivated me to create this app, to compare their
          paths minute by minute and better understand their behavior. <br />
          <br />I hope it will be useful to you too!
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
          <span className="text-xs font-thin">
            Your data stays safe: the app doesn’t use cookies, and the routes
            you upload are saved only on your device.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

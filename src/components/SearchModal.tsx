"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const OPEN_SEARCH_EVENT = "open-search";

export interface SearchModalProps {
  /** Base URL path for the Pagefind bundle (e.g. "/pagefind/") */
  bundlePath: string;
  className?: string;
}

/**
 * Search modal opened by Cmd+K / Ctrl+K or the nav Search link.
 * Renders Pagefind UI inside a dialog; initializes Pagefind when content is mounted.
 * On Cloudflare Pages, the Pagefind bundle is loaded from /pagefind/ (static assets in dist).
 */
export function SearchModal({ bundlePath, className }: SearchModalProps) {
  const [open, setOpen] = React.useState(false);
  const initedForOpenRef = React.useRef(false);

  React.useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
  }, []);

  React.useEffect(() => {
    if (!open) {
      initedForOpenRef.current = false;
      return;
    }
    if (initedForOpenRef.current) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      import("@pagefind/default-ui").then(({ PagefindUI }) => {
        if (cancelled || initedForOpenRef.current) return;
        const el = document.getElementById("pagefind-search-modal");
        if (!el) return;
        new PagefindUI({
          element: "#pagefind-search-modal",
          bundlePath,
          showImages: false,
        });
        initedForOpenRef.current = true;
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, bundlePath]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-w-2xl flex-col overflow-hidden p-0 gap-0 h-[80vh] max-h-[80vh]",
          className,
        )}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across blog posts, projects, and experiences.
        </DialogDescription>
        {/* Header: close only, above search (modal chrome) */}
        <div className="flex shrink-0 justify-end px-4 pt-4 pb-2">
          <DialogClose
            className="cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </DialogClose>
        </div>
        {/* Body: full-width search + results, scrollbar at modal edge */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-8 pt-0">
          <div
            id="pagefind-search-modal"
            className="flex h-full min-h-0 flex-col overflow-hidden [&_.pagefind-ui]:!mt-0 [&_.pagefind-ui]:!mb-0"
            data-pagefind-ui
            data-bundle-path={bundlePath}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Dispatches the event to open the search modal. Call from nav or keyboard handler. */
export function openSearchModal() {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
}

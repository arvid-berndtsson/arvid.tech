"use client";

import * as React from "react";
import { Command, CommandList } from "@/components/ui/command";

export interface TestSearchBoxProps {
  bundlePath: string;
}

/**
 * Test page search: shadcn Command shell with Pagefind UI inside (Deno-style).
 */
export function TestSearchBox({ bundlePath }: TestSearchBoxProps) {
  const initedRef = React.useRef(false);

  React.useEffect(() => {
    if (initedRef.current) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      import("@pagefind/default-ui").then(({ PagefindUI }) => {
        if (cancelled || initedRef.current) return;
        const el = document.getElementById("test-search");
        if (!el) return;
        new PagefindUI({
          element: "#test-search",
          bundlePath,
          showImages: false,
        });
        initedRef.current = true;
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bundlePath]);

  return (
    <Command className="rounded-lg border border-border bg-background shadow-lg overflow-hidden">
      <CommandList className="max-h-[60vh] p-0">
        <div
          id="test-search"
          className="min-h-[280px] px-4 pt-4 pb-4 [&_.pagefind-ui]:!mt-0 [&_.pagefind-ui]:!mb-0"
          data-pagefind-ui
          data-bundle-path={bundlePath}
        />
      </CommandList>
    </Command>
  );
}

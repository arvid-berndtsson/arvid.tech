"use client";

import * as React from "react";
import {
  BookOpen,
  Briefcase,
  FolderKanban,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { openSearchModal } from "@/components/SearchModal";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Blog: BookOpen,
  Projects: FolderKanban,
  Experiences: Briefcase,
  About: User,
  Search: Search,
};

export interface NavItem {
  name: string;
  href: string;
}

export interface NavBarProps {
  siteName: string;
  navigation: NavItem[];
  /** Current pathname for marking active nav link (e.g. from Astro.url.pathname) */
  currentPath?: string;
}

export function NavBar({
  siteName,
  navigation,
  currentPath = "",
}: NavBarProps) {
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (!currentPath) return false;
    return (
      currentPath === href ||
      (href !== "/" && currentPath.startsWith(href + "/"))
    );
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      aria-label="Main navigation"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-lg">
          <div className="flex h-16 items-center justify-between">
            <a
              href="/"
              className="text-lg font-bold tracking-tight text-foreground transition-colors hover:text-amber-700 dark:hover:text-amber-500"
            >
              {siteName}
            </a>

            <nav
              className="hidden lg:flex items-center flex-1 justify-end gap-7"
              aria-label="Primary"
            >
              <NavigationMenu
                viewport={false}
                className="max-w-none flex-1 justify-end"
              >
                <NavigationMenuList className="flex h-9 items-center gap-7 bg-transparent p-0">
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        asChild
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent h-9 min-h-9 px-0 py-0 font-medium inline-flex items-center",
                        )}
                      >
                        <a
                          href={item.href}
                          {...(isActive(item.href) && {
                            "aria-current": "page" as const,
                          })}
                        >
                          {item.name}
                        </a>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent h-9 min-h-9 px-0 py-0 inline-flex items-center justify-center",
                      )}
                    >
                      <a
                        href="/search"
                        aria-label="Search"
                        className="inline-flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          openSearchModal();
                        }}
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                id="theme-toggle"
                className="text-muted-foreground hover:text-foreground rounded-full shrink-0"
                aria-label="Toggle dark mode"
              >
                <span
                  className="theme-icon-light hidden dark:inline"
                  aria-hidden
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </span>
                <span
                  className="theme-icon-dark inline dark:hidden"
                  aria-hidden
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </span>
              </Button>
            </nav>

            <div
              className="flex items-center gap-2 lg:hidden"
              aria-label="Mobile menu"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                id="theme-toggle-mobile"
                className="text-muted-foreground rounded-full"
                aria-label="Toggle dark mode"
              >
                <span
                  className="theme-icon-light hidden dark:inline"
                  aria-hidden
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </span>
                <span
                  className="theme-icon-dark inline dark:hidden"
                  aria-hidden
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </span>
              </Button>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    aria-expanded={open}
                    className="rounded-full"
                    data-testid="mobile-menu-button"
                  >
                    <Menu className="size-5" aria-hidden />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="flex w-full flex-col border-l bg-background p-0 sm:max-w-sm"
                >
                  <SheetHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4">
                    <SheetTitle className="text-base font-semibold">
                      Menu
                    </SheetTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="-mr-2 rounded-full"
                      aria-label="Close menu"
                      onClick={() => setOpen(false)}
                    >
                      <X className="size-5" aria-hidden />
                    </Button>
                  </SheetHeader>
                  <nav
                    className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
                    aria-label="Mobile navigation"
                  >
                    <ul className="flex flex-col gap-1" role="list">
                      {navigation.map((item) => {
                        const Icon = MOBILE_NAV_ICONS[item.name];
                        return (
                          <li key={item.href}>
                            <a
                              href={item.href}
                              {...(isActive(item.href) && {
                                "aria-current": "page" as const,
                              })}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium",
                                "text-muted-foreground transition-colors",
                                "hover:bg-muted hover:text-foreground",
                                "focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              )}
                              onClick={() => setOpen(false)}
                            >
                              {Icon ? (
                                <Icon
                                  className="size-5 shrink-0 text-muted-foreground"
                                  aria-hidden
                                />
                              ) : null}
                              {item.name}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                    <Separator className="my-2" />
                    <ul className="flex flex-col gap-1" role="list">
                      <li>
                        <a
                          href="/search"
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium",
                            "text-muted-foreground transition-colors",
                            "hover:bg-muted hover:text-foreground",
                            "focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            openSearchModal();
                            setOpen(false);
                          }}
                        >
                          <Search
                            className="size-5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          Search
                        </a>
                      </li>
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

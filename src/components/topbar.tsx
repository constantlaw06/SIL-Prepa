"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

import { UserMenu } from "@/components/auth/user-menu";
import { ExamDateControl } from "@/components/exam-date-control";
import { GlobalSearch } from "@/components/global-search";
import { pageTitle } from "@/lib/navigation";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Ouvrir le menu de navigation"
          className="-ml-1 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Bars3Icon aria-hidden="true" className="size-5" />
        </button>

        <h1 className="truncate text-base font-semibold">{pageTitle(pathname)}</h1>

        <div className="hidden flex-1 justify-center lg:flex">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <div className="hidden sm:block">
            <ExamDateControl />
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Recherche et date passent sur une seconde ligne sous grand écran */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <GlobalSearch />
        </div>
        <div className="shrink-0 sm:hidden">
          <ExamDateControl />
        </div>
      </div>
    </header>
  );
}

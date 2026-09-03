"use client";

import { Bars3Icon, BoltIcon, CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserMenu } from "@/components/auth/user-menu";
import { GlobalSearch } from "@/components/global-search";
import { Button } from "@/components/ui/button";
import { PLAN_LEN } from "@/data/plan";
import { useExamDate } from "@/hooks/use-exam-date";
import { currentPlanDay, daysLeft, themeOfTheDay } from "@/lib/exam-date";
import { pageTitle } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { exam, setExam, ready } = useExamDate();
  const left = daysLeft(exam);
  const planDay = currentPlanDay(exam);
  const todayTheme = themeOfTheDay(planDay);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Ouvrir le menu"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Bars3Icon aria-hidden="true" className="size-5" />
        </button>

        <h1 className="truncate text-base font-semibold">{pageTitle(pathname)}</h1>

        <Button asChild size="sm" className="hidden shrink-0 sm:inline-flex">
          <Link href={todayTheme ? `/quiz/${todayTheme}` : "/plan"}>
            <BoltIcon aria-hidden="true" />
            {todayTheme ? "Réviser aujourd'hui" : "Voir le plan"}
          </Link>
        </Button>

        <div className="hidden flex-1 justify-center md:flex">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <span
            className={cn(
              "hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline",
              left <= 3
                ? "bg-destructive/15 text-destructive"
                : left <= 10
                  ? "bg-warning/15 text-warning"
                  : "bg-primary/15 text-primary",
            )}
          >
            {ready
              ? planDay
                ? `J${planDay}/${PLAN_LEN} - ${Math.max(0, left)} j restants`
                : `${Math.max(0, left)} j restants`
              : "..."}
          </span>

          <label className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs text-muted-foreground">
            <CalendarIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">Date de l&apos;examen</span>
            <input
              type="date"
              value={ready ? exam : ""}
              onChange={(e) => setExam(e.target.value)}
              className="bg-transparent text-foreground focus-visible:outline-none"
            />
          </label>

          <UserMenu />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}

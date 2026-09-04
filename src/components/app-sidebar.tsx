"use client";

import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BANK } from "@/data/bank";
import { useResults } from "@/hooks/use-results";
import { globalProgress } from "@/lib/mastery";
import { NAV, isActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function NavGroup({
  item,
  pathname,
  onNavigate,
  counter,
}: {
  item: (typeof NAV)[number];
  pathname: string;
  onNavigate: () => void;
  /** Indicateur contextuel, ex. « 3/13 » ou « 8 ». */
  counter?: string;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  const [open, setOpen] = useState(active);

  const row = cn(
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
    active
      ? "bg-primary/12 font-medium text-primary"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

  return (
    <li>
      <div className="flex items-center gap-1">
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(row, "flex-1")}
        >
          <Icon aria-hidden="true" className="size-4.5 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {counter && (
            <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
              {counter}
            </span>
          )}
        </Link>

        {item.children && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Replier" : "Déplier"} ${item.label}`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ChevronRightIcon
              aria-hidden="true"
              className={cn("size-3.5 transition-transform", open && "rotate-90")}
            />
          </button>
        )}
      </div>

      {item.children && open && (
        <ul className="mt-0.5 mb-1 ml-5 space-y-0.5 border-l border-sidebar-border pl-2">
          {item.children.map((child) => {
            const childActive = pathname === child.href;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "block truncate rounded-md px-2 py-1.5 text-xs transition-colors",
                    childActive
                      ? "bg-primary/12 font-medium text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { results } = useResults();
  const progress = globalProgress(BANK, results);

  // Indicateurs contextuels : uniquement quand ils apportent une information.
  const counters: Record<string, string | undefined> = {
    themes: `${progress.started}/${progress.total}`,
    errors: progress.totalWrong > 0 ? String(progress.totalWrong) : undefined,
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
          <Image
            src="/logo-sil-prepa-dark.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-md"
            priority
          />
          <span className="flex-1 truncate font-semibold">Prépa SIL</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <XMarkIcon aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <NavGroup
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
                counter={item.counter ? counters[item.counter] : undefined}
              />
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-sidebar-border px-4 py-3 text-[11px] text-muted-foreground">
          Licence SIL - Tronc commun + Spécialité
        </div>
      </aside>
    </>
  );
}

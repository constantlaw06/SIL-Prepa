"use client";

import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NAV, isActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: (typeof NAV)[number];
  pathname: string;
  onNavigate: () => void;
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
          <span className="truncate">{item.label}</span>
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
          <span
            aria-hidden="true"
            className="size-6 shrink-0 rounded-full bg-primary/20 ring-2 ring-primary/60"
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

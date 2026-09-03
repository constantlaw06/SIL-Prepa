"use client";

import {
  ArrowRightOnRectangleIcon,
  CloudArrowUpIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <span className="size-8 animate-pulse rounded-full bg-secondary" />;
  }

  if (status !== "authenticated") {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/connexion">
          <UserCircleIcon aria-hidden="true" />
          <span className="hidden sm:inline">Se connecter</span>
        </Link>
      </Button>
    );
  }

  const user = session.user;
  const initial = (user?.name ?? user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border py-1 pr-2.5 pl-1 text-sm hover:bg-accent"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">
          {user?.name ?? user?.email}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute top-11 right-0 z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-xl"
          >
            <p className="truncate text-sm font-medium">{user?.name ?? "Compte"}</p>
            {user?.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}

            <p className="mt-3 flex items-start gap-2 rounded-md bg-success/10 p-2 text-xs text-success">
              <CloudArrowUpIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Ta progression est enregistrée sur ce compte et te suit d&apos;un
              appareil à l&apos;autre.
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <ArrowRightOnRectangleIcon aria-hidden="true" />
              Se déconnecter
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

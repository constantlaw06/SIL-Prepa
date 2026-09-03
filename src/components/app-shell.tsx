"use client";

import { SessionProvider } from "next-auth/react";
import { useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ProgressSync } from "@/components/auth/progress-sync";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SessionProvider>
      <ProgressSync />
      <div className="min-h-full">
        <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex min-h-screen flex-col lg:pl-60">
          <Topbar onOpenMenu={() => setMenuOpen(true)} />
          <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground lg:px-6">
            Prépa SIL - refais chaque série jusqu&apos;à la maîtrise
          </footer>
        </div>
      </div>
    </SessionProvider>
  );
}

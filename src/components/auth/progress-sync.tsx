"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getResultsSnapshot, replaceResults } from "@/lib/results-store";

/**
 * À la connexion, pousse la progression enregistrée dans ce navigateur vers le
 * compte, puis adopte la progression fusionnée renvoyée par le serveur. Les
 * séries sont dédupliquées par thème et horodatage : rejouer l'opération est
 * sans effet.
 */
export function ProgressSync() {
  const { status } = useSession();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || syncedFor.current === status) return;
    syncedFor.current = status;

    const controller = new AbortController();
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: getResultsSnapshot().history }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.history) replaceResults(data.history);
      })
      .catch(() => {
        // Hors ligne ou serveur indisponible : on garde la progression locale.
      });

    return () => controller.abort();
  }, [status]);

  return null;
}

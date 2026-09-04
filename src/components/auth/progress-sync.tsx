"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { getExercisesSnapshot, replaceExercises } from "@/lib/exercise-store";
import { getResultsSnapshot, replaceResults } from "@/lib/results-store";

/**
 * À la connexion, pousse la progression enregistrée dans ce navigateur vers le
 * compte (séries de quiz et auto-évaluations d'exercices), puis adopte la
 * version fusionnée renvoyée par le serveur. Les entrées sont dédupliquées
 * (thème+horodatage pour les quiz, index pour les exercices) : rejouer
 * l'opération est sans effet.
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

    fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: Object.values(getExercisesSnapshot().byIndex) }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.results) replaceExercises(data.results);
      })
      .catch(() => {
        // Hors ligne ou serveur indisponible : on garde l'évaluation locale.
      });

    return () => controller.abort();
  }, [status]);

  return null;
}

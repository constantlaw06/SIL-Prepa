"use client";

import { useSyncExternalStore } from "react";

import {
  getResultsServerSnapshot,
  getResultsSnapshot,
  subscribeResults,
} from "@/lib/results-store";

const noopSubscribe = () => () => {};

/**
 * Progression enregistrée localement.
 * `ready` reste false avant hydratation : les pages sont générées au build,
 * elles ne peuvent donc afficher aucune statistique côté serveur.
 */
export function useResults() {
  const results = useSyncExternalStore(
    subscribeResults,
    getResultsSnapshot,
    getResultsServerSnapshot,
  );
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return { results, ready };
}

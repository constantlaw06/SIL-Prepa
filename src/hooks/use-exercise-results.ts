"use client";

import { useSyncExternalStore } from "react";

import {
  getExercisesServerSnapshot,
  getExercisesSnapshot,
  subscribeExercises,
} from "@/lib/exercise-store";

/**
 * Auto-évaluations d'exercices enregistrées localement.
 * `ready` reste false avant hydratation : les pages sont générées au build,
 * elles ne peuvent donc afficher aucun résultat côté serveur.
 */
export function useExerciseResults() {
  const results = useSyncExternalStore(
    subscribeExercises,
    getExercisesSnapshot,
    getExercisesServerSnapshot,
  );
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return { results, ready };
}

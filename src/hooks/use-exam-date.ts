"use client";

import { useSyncExternalStore } from "react";

import {
  getExamDateServerSnapshot,
  getExamDateSnapshot,
  setExamDate,
  subscribeExamDate,
} from "@/lib/exam-store";

const noopSubscribe = () => () => {};

/**
 * Date de l'examen, persistée dans le localStorage.
 * `ready` vaut false tant que l'hydratation n'a pas eu lieu : le HTML statique
 * est généré au build, il ne doit donc afficher aucun décompte.
 */
export function useExamDate() {
  const exam = useSyncExternalStore(
    subscribeExamDate,
    getExamDateSnapshot,
    getExamDateServerSnapshot,
  );
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return { exam, setExam: setExamDate, ready };
}

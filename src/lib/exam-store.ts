import { EXAM_STORAGE_KEY, defaultExamDate } from "@/lib/exam-date";

/**
 * Petit store externe autour du localStorage, lu via `useSyncExternalStore`.
 * Évite un setState dans un effet et synchronise les onglets ouverts.
 */
const listeners = new Set<() => void>();

/** Repli mémoire quand le localStorage est inaccessible. */
let memoryValue: string | null = null;

/** Valeur stable utilisée au rendu serveur et pendant l'hydratation. */
const SERVER_SNAPSHOT = defaultExamDate();

export function subscribeExamDate(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === EXAM_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getExamDateSnapshot() {
  try {
    return (
      window.localStorage.getItem(EXAM_STORAGE_KEY) ??
      memoryValue ??
      SERVER_SNAPSHOT
    );
  } catch {
    // localStorage indisponible (navigation privée) : on retombe sur la mémoire de session.
    return memoryValue ?? SERVER_SNAPSHOT;
  }
}

export function getExamDateServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function setExamDate(value: string) {
  memoryValue = value;
  try {
    window.localStorage.setItem(EXAM_STORAGE_KEY, value);
  } catch {
    // ignoré volontairement : la valeur ne survivra pas au rechargement
  }
  listeners.forEach((l) => l());
}

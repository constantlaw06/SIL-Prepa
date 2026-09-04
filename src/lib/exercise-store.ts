export const EXERCISES_STORAGE_KEY = "sil_exercises";

/** Auto-évaluation d'un exercice rédigé. `at` est un horodatage ISO. */
export type ExerciseResult = {
  index: number;
  correct: boolean;
  at: string;
};

export type ExercisesState = {
  byIndex: Record<number, ExerciseResult>;
};

const EMPTY: ExercisesState = { byIndex: {} };

const listeners = new Set<() => void>();

/*
 * `useSyncExternalStore` compare les snapshots par identité : on met donc en
 * cache la valeur analysée et on ne la recalcule que si le JSON stocké change.
 */
let cachedRaw: string | null = null;
let cachedValue: ExercisesState = EMPTY;

function parse(raw: string | null): ExercisesState {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<ExercisesState>;
    return { byIndex: parsed.byIndex ?? {} };
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(EXERCISES_STORAGE_KEY);
  } catch {
    // Stockage inaccessible : on conserve ce qui a été enregistré en mémoire.
    return cachedRaw;
  }
}

export function subscribeExercises(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === EXERCISES_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getExercisesSnapshot(): ExercisesState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

export function getExercisesServerSnapshot(): ExercisesState {
  return EMPTY;
}

function commit(next: ExercisesState) {
  cachedValue = next;
  cachedRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(EXERCISES_STORAGE_KEY, cachedRaw);
  } catch {
    // Stockage indisponible : l'auto-évaluation reste valable pour la session.
  }
  listeners.forEach((l) => l());
}

/**
 * Envoie l'auto-évaluation au compte connecté. Sans session, l'API répond
 * 401 et l'entrée reste purement locale : l'échec est donc sans conséquence.
 */
function push(results: ExerciseResult[]) {
  void fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results }),
  }).catch(() => {});
}

/** Enregistre l'auto-évaluation d'un exercice et notifie les abonnés. */
export function recordExercise(index: number, correct: boolean) {
  const current = getExercisesSnapshot();
  const result: ExerciseResult = { index, correct, at: new Date().toISOString() };
  commit({ byIndex: { ...current.byIndex, [index]: result } });
  push([result]);
}

/** Remplace l'état local par celui du compte (après synchronisation). */
export function replaceExercises(list: ExerciseResult[]) {
  const byIndex: Record<number, ExerciseResult> = {};
  for (const r of list) byIndex[r.index] = r;
  commit({ byIndex });
}

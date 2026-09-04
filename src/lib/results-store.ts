export const RESULTS_STORAGE_KEY = "sil_results";

/** Une série corrigée. `at` est un horodatage ISO. */
export type QuizResult = {
  theme: string;
  score: number;
  gradable: number;
  pct: number;
  at: string;
  /**
   * Index des questions ratées dans le thème, alimentant le carnet d erreurs.
   * Absent sur les séries enregistrees avant l ajout du carnet.
   */
  wrong?: number[];
};

export type ResultsState = {
  /** Dernier résultat connu pour chaque thème. */
  last: Record<string, QuizResult>;
  /** Historique des séries, de la plus ancienne à la plus récente. */
  history: QuizResult[];
};

const EMPTY: ResultsState = { last: {}, history: [] };
const HISTORY_MAX = 30;

const listeners = new Set<() => void>();

/*
 * `useSyncExternalStore` compare les snapshots par identité : on met donc en
 * cache la valeur analysée et on ne la recalcule que si le JSON stocké change.
 */
let cachedRaw: string | null = null;
let cachedValue: ResultsState = EMPTY;

function parse(raw: string | null): ResultsState {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<ResultsState>;
    return {
      last: parsed.last ?? {},
      history: parsed.history ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(RESULTS_STORAGE_KEY);
  } catch {
    // Stockage inaccessible : on conserve ce qui a ete enregistre en memoire.
    return cachedRaw;
  }
}

export function subscribeResults(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === RESULTS_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getResultsSnapshot(): ResultsState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

export function getResultsServerSnapshot(): ResultsState {
  return EMPTY;
}

function commit(next: ResultsState) {
  cachedValue = next;
  cachedRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(RESULTS_STORAGE_KEY, cachedRaw);
  } catch {
    // Stockage indisponible : la progression reste valable pour la session.
  }
  listeners.forEach((l) => l());
}

/** Reconstruit le dernier score de chaque thème à partir de l'historique. */
export function fromHistory(history: QuizResult[]): ResultsState {
  const ordered = [...history].sort((a, b) => a.at.localeCompare(b.at));
  const last: Record<string, QuizResult> = {};
  for (const r of ordered) last[r.theme] = r;
  return { last, history: ordered.slice(-HISTORY_MAX) };
}

/**
 * Envoie la série au compte connecté. Sans session, l'API répond 401 et la
 * progression reste purement locale : l'échec est donc sans conséquence.
 */
function push(results: QuizResult[]) {
  void fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results }),
  }).catch(() => {});
}

/** Enregistre une série corrigée et notifie les composants abonnés. */
export function recordResult(result: QuizResult) {
  const current = getResultsSnapshot();
  commit({
    last: { ...current.last, [result.theme]: result },
    history: [...current.history, result].slice(-HISTORY_MAX),
  });
  push([result]);
}

/** Remplace la progression locale par celle du compte (après synchronisation). */
export function replaceResults(history: QuizResult[]) {
  commit(fromHistory(history));
}

export function clearResults() {
  cachedValue = EMPTY;
  cachedRaw = null;
  try {
    window.localStorage.removeItem(RESULTS_STORAGE_KEY);
  } catch {
    // ignoré volontairement
  }
  listeners.forEach((l) => l());
}

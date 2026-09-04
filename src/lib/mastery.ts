import type { QuizResult, ResultsState } from "@/lib/results-store";
import type { Bank } from "@/lib/types";

/** Seuil de maîtrise commun à toute l'application. */
export const MASTERY_TARGET = 80;
/** En dessous, le thème est considéré comme fragile. */
export const WEAK_THRESHOLD = 50;

/**
 * États d'une ressource. Ils décrivent ce que l'utilisateur a réellement fait,
 * jamais une valeur par défaut optimiste : sans historique, c'est « new ».
 */
export type ResourceState = "new" | "in-progress" | "review" | "mastered";

export const STATE_LABELS: Record<ResourceState, string> = {
  new: "Non commencé",
  "in-progress": "En cours",
  review: "À reprendre",
  mastered: "Maîtrisé",
};

/**
 * Chaque état porte un libellé ET une forme distincte (symbole), pour ne
 * jamais dépendre de la seule couleur (WCAG 1.4.1).
 */
export const STATE_MARKS: Record<ResourceState, string> = {
  new: "○",
  "in-progress": "◐",
  review: "!",
  mastered: "✓",
};

export const STATE_CLASSES: Record<ResourceState, string> = {
  new: "border-border text-muted-foreground",
  "in-progress": "border-primary/40 bg-primary/10 text-primary",
  review: "border-destructive/40 bg-destructive/10 text-destructive",
  mastered: "border-success/40 bg-success/10 text-success",
};

/** Un thème sans résultat est « non commencé », jamais « à reprendre ». */
export function stateOf(result: QuizResult | null | undefined): ResourceState {
  if (!result) return "new";
  if (result.pct >= MASTERY_TARGET) return "mastered";
  if (result.pct < WEAK_THRESHOLD) return "review";
  return "in-progress";
}

export type ThemeProgress = {
  key: string;
  title: string;
  questionCount: number;
  /** Questions notées automatiquement (hors questions ouvertes). */
  gradableCount: number;
  result: QuizResult | null;
  state: ResourceState;
  pct: number | null;
  /** Points de pourcentage manquants pour atteindre l'objectif. */
  gap: number;
  attempts: number;
  wrongCount: number;
  /** Estimation de durée : 45 s par question notée, arrondie à la minute. */
  minutes: number;
};

export function estimateMinutes(questionCount: number) {
  return Math.max(1, Math.round((questionCount * 45) / 60));
}

export function themeProgress(bank: Bank, results: ResultsState): ThemeProgress[] {
  return Object.entries(bank).map(([key, theme]) => {
    const result = results.last[key] ?? null;
    const gradableCount = theme.qs.filter((q) => q.type !== "short").length;
    const attempts = results.history.filter((h) => h.theme === key).length;
    return {
      key,
      title: theme.title,
      questionCount: theme.qs.length,
      gradableCount,
      result,
      state: stateOf(result),
      pct: result ? result.pct : null,
      gap: result ? Math.max(0, MASTERY_TARGET - result.pct) : MASTERY_TARGET,
      attempts,
      wrongCount: result?.wrong?.length ?? 0,
      minutes: estimateMinutes(theme.qs.length),
    };
  });
}

export type GlobalProgress = {
  themes: ThemeProgress[];
  total: number;
  started: number;
  mastered: number;
  weak: ThemeProgress[];
  /** Questions notées appartenant à un thème déjà travaillé. */
  questionsAnswered: number;
  questionsTotal: number;
  averagePct: number | null;
  totalWrong: number;
};

export function globalProgress(bank: Bank, results: ResultsState): GlobalProgress {
  const themes = themeProgress(bank, results);
  const started = themes.filter((t) => t.result);
  const questionsTotal = themes.reduce((n, t) => n + t.questionCount, 0);

  return {
    themes,
    total: themes.length,
    started: started.length,
    mastered: themes.filter((t) => t.state === "mastered").length,
    weak: themes
      .filter((t) => t.result && t.state !== "mastered")
      .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0)),
    questionsAnswered: started.reduce((n, t) => n + t.questionCount, 0),
    questionsTotal,
    averagePct: started.length
      ? Math.round(started.reduce((n, t) => n + (t.pct ?? 0), 0) / started.length)
      : null,
    totalWrong: themes.reduce((n, t) => n + t.wrongCount, 0),
  };
}

export type Recommendation = {
  theme: ThemeProgress;
  /** Raison affichée à l'utilisateur : pourquoi ce thème maintenant. */
  reason: string;
};

/**
 * Choisit le thème à travailler maintenant, par ordre de priorité :
 * 1. un thème déjà tenté sous le seuil de fragilité (le plus faible d'abord) ;
 * 2. le thème planifié du jour s'il n'est pas encore maîtrisé ;
 * 3. un thème jamais tenté (dans l'ordre du programme) ;
 * 4. le thème le plus éloigné de l'objectif ;
 * 5. sinon rien : tout est maîtrisé.
 */
export function recommend(
  progress: GlobalProgress,
  planThemeKey: string | null,
): Recommendation | null {
  const { themes } = progress;

  const weakest = themes
    .filter((t) => t.result && t.pct !== null && t.pct < WEAK_THRESHOLD)
    .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0];
  if (weakest) {
    return {
      theme: weakest,
      reason: `Ton score le plus bas (${weakest.pct} %). C'est là que tu gagnes le plus de points.`,
    };
  }

  const planned = planThemeKey ? themes.find((t) => t.key === planThemeKey) : undefined;
  if (planned && planned.state !== "mastered") {
    return {
      theme: planned,
      reason: "C'est le thème prévu par ton plan de révision aujourd'hui.",
    };
  }

  const untouched = themes.find((t) => !t.result);
  if (untouched) {
    return {
      theme: untouched,
      reason: progress.started
        ? "Thème encore jamais travaillé : il faut d'abord situer ton niveau."
        : "Commence par ce thème pour établir ton niveau de départ.",
    };
  }

  const toImprove = themes
    .filter((t) => t.state !== "mastered")
    .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0];
  if (toImprove) {
    return {
      theme: toImprove,
      reason: `Il te manque ${toImprove.gap} points pour atteindre l'objectif de ${MASTERY_TARGET} %.`,
    };
  }

  return null;
}

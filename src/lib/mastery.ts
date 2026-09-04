import { allSets, themeSets } from "@/lib/quiz-sets";
import type { QuizSet } from "@/lib/quiz-sets";
import type { QuizResult, ResultsState } from "@/lib/results-store";
import type { Bank } from "@/lib/types";

/** Seuil de maîtrise commun à toute l'application. */
export const MASTERY_TARGET = 80;
/** En dessous, la ressource est considérée comme fragile. */
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

function stateFromPct(pct: number | null): ResourceState {
  if (pct === null) return "new";
  if (pct >= MASTERY_TARGET) return "mastered";
  if (pct < WEAK_THRESHOLD) return "review";
  return "in-progress";
}

/** Un questionnaire sans résultat est « non commencé », jamais « à reprendre ». */
export function stateOf(result: QuizResult | null | undefined): ResourceState {
  return stateFromPct(result ? result.pct : null);
}

export function estimateMinutes(questionCount: number) {
  return Math.max(1, Math.round((questionCount * 45) / 60));
}

export type SetProgress = {
  /** Identifiant du questionnaire : sert de clé de résultat et de route. */
  key: string;
  themeKey: string;
  title: string;
  setNumber: number;
  setCount: number;
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
  minutes: number;
};

/** Progression par questionnaire (granularité de la prise de quiz). */
export function setProgress(bank: Bank, results: ResultsState): SetProgress[] {
  return allSets(bank).map((set) => setProgressOf(set, results));
}

export function setProgressOf(set: QuizSet, results: ResultsState): SetProgress {
  const result = results.last[set.id] ?? null;
  const gradableCount = set.qs.filter((q) => q.type !== "short").length;
  const attempts = results.history.filter((h) => h.theme === set.id).length;
  return {
    key: set.id,
    themeKey: set.themeKey,
    title: set.title,
    setNumber: set.setNumber,
    setCount: set.setCount,
    questionCount: set.qs.length,
    gradableCount,
    result,
    state: stateOf(result),
    pct: result ? result.pct : null,
    gap: result ? Math.max(0, MASTERY_TARGET - result.pct) : MASTERY_TARGET,
    attempts,
    wrongCount: result?.wrong?.length ?? 0,
    minutes: estimateMinutes(set.qs.length),
  };
}

export type ThemeProgress = {
  key: string;
  title: string;
  questionCount: number;
  setCount: number;
  sets: SetProgress[];
  /** Questionnaires déjà tentés au moins une fois. */
  attemptedSets: number;
  state: ResourceState;
  /** Moyenne des scores des questionnaires tentés, ou null si aucun. */
  pct: number | null;
  gap: number;
  wrongCount: number;
  minutes: number;
};

/**
 * Vue par thème : agrège ses questionnaires. Utilisée partout où l'unité
 * pertinente est le thème (tableau de bord, barre latérale, plan), tandis que
 * la prise de quiz et le carnet d'erreurs travaillent au niveau du
 * questionnaire via `setProgress`.
 */
export function themeProgress(bank: Bank, results: ResultsState): ThemeProgress[] {
  return Object.entries(bank).map(([key, theme]) => {
    const sets = themeSets(key, theme).map((s) => setProgressOf(s, results));
    const attempted = sets.filter((s) => s.result);
    const pct = attempted.length
      ? Math.round(attempted.reduce((n, s) => n + (s.pct ?? 0), 0) / attempted.length)
      : null;

    return {
      key,
      title: theme.title,
      questionCount: theme.qs.length,
      setCount: sets.length,
      sets,
      attemptedSets: attempted.length,
      state: stateFromPct(pct),
      pct,
      gap: pct !== null ? Math.max(0, MASTERY_TARGET - pct) : MASTERY_TARGET,
      wrongCount: sets.reduce((n, s) => n + s.wrongCount, 0),
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
  /** Questions appartenant à un thème dont au moins un questionnaire a été tenté. */
  questionsAnswered: number;
  questionsTotal: number;
  averagePct: number | null;
  totalWrong: number;
};

export function globalProgress(bank: Bank, results: ResultsState): GlobalProgress {
  const themes = themeProgress(bank, results);
  const started = themes.filter((t) => t.attemptedSets > 0);
  const questionsTotal = themes.reduce((n, t) => n + t.questionCount, 0);

  return {
    themes,
    total: themes.length,
    started: started.length,
    mastered: themes.filter((t) => t.state === "mastered").length,
    weak: themes
      .filter((t) => t.pct !== null && t.state !== "mastered")
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
  /** Le questionnaire précis à ouvrir : le premier à travailler dans ce thème. */
  set: SetProgress;
  /** Raison affichée à l'utilisateur : pourquoi ce thème maintenant. */
  reason: string;
};

function firstActionableSet(theme: ThemeProgress): SetProgress {
  return (
    theme.sets.find((s) => s.state !== "mastered") ??
    theme.sets[0]
  );
}

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
    .filter((t) => t.pct !== null && t.pct < WEAK_THRESHOLD)
    .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0];
  if (weakest) {
    return {
      theme: weakest,
      set: firstActionableSet(weakest),
      reason: `Ton score le plus bas (${weakest.pct} %). C'est là que tu gagnes le plus de points.`,
    };
  }

  const planned = planThemeKey ? themes.find((t) => t.key === planThemeKey) : undefined;
  if (planned && planned.state !== "mastered") {
    return {
      theme: planned,
      set: firstActionableSet(planned),
      reason: "C'est le thème prévu par ton plan de révision aujourd'hui.",
    };
  }

  const untouched = themes.find((t) => t.attemptedSets === 0);
  if (untouched) {
    return {
      theme: untouched,
      set: firstActionableSet(untouched),
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
      set: firstActionableSet(toImprove),
      reason: `Il te manque ${toImprove.gap} points pour atteindre l'objectif de ${MASTERY_TARGET} %.`,
    };
  }

  return null;
}

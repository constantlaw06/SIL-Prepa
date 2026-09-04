import type { Bank, Question, Theme } from "@/lib/types";

/** Aucun questionnaire ne dépasse ce nombre de questions. */
export const MAX_SET_SIZE = 15;

export type QuizSet = {
  /** Identifiant unique : la clé du thème seule s'il n'y a qu'une série. */
  id: string;
  themeKey: string;
  themeTitle: string;
  /** Titre affiché : identique au thème quand il n'y a qu'une série. */
  title: string;
  setNumber: number;
  setCount: number;
  qs: Question[];
};

/**
 * Découpe les questions d'un thème en plusieurs questionnaires de taille
 * équilibrée, chacun plafonné à MAX_SET_SIZE. Un thème de 18 questions donne
 * ainsi deux séries de 9, plutôt qu'une série de 15 et une de 3.
 */
export function themeSets(themeKey: string, theme: Theme): QuizSet[] {
  const total = theme.qs.length;
  const setCount = Math.max(1, Math.ceil(total / MAX_SET_SIZE));
  const size = Math.ceil(total / setCount);

  const chunks: Question[][] = [];
  for (let i = 0; i < total; i += size) {
    chunks.push(theme.qs.slice(i, i + size));
  }
  if (chunks.length === 0) chunks.push([]);

  return chunks.map((qs, i) => ({
    id: chunks.length > 1 ? `${themeKey}-${i + 1}` : themeKey,
    themeKey,
    themeTitle: theme.title,
    title: chunks.length > 1 ? `${theme.title} · Série ${i + 1}` : theme.title,
    setNumber: i + 1,
    setCount: chunks.length,
    qs,
  }));
}

export function allSets(bank: Bank): QuizSet[] {
  return Object.entries(bank).flatMap(([key, theme]) => themeSets(key, theme));
}

/** Résout un identifiant de route (`"web"` ou `"web-2"`) vers son questionnaire. */
export function findSet(bank: Bank, id: string): QuizSet | undefined {
  return allSets(bank).find((s) => s.id === id);
}

/**
 * URL d'un questionnaire : `/quiz/<thème>` quand il n'y en a qu'un,
 * `/quiz/<thème>/<n>` sinon. Centralisé ici pour que toute l'app pointe
 * systématiquement vers la bonne route.
 */
export function setHref(set: Pick<QuizSet, "themeKey" | "setNumber" | "setCount">) {
  return set.setCount > 1
    ? `/quiz/${set.themeKey}/${set.setNumber}`
    : `/quiz/${set.themeKey}`;
}

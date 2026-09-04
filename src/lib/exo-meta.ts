import type { Exo } from "@/lib/types";

export type Level = "Facile" | "Moyen" | "Difficile";

export const LEVELS: Level[] = ["Facile", "Moyen", "Difficile"];

export const LEVEL_CLASSES: Record<Level, string> = {
  Facile: "border-success/40 bg-success/10 text-success",
  Moyen: "border-warning/40 bg-warning/10 text-warning",
  Difficile: "border-destructive/40 bg-destructive/10 text-destructive",
};

export type ExoMeta = {
  /** Durée annoncée, ex. « 15 min ». */
  duration: string | null;
  /**
   * Niveau annoncé par l'énoncé d'origine. `null` quand la donnée n'existe
   * pas : on n'invente pas une difficulté qu'on ne connaît pas.
   */
  level: Level | null;
};

/**
 * Le champ `diff` du document d'origine agrège durée et niveau sous la forme
 * « 20 min · Moyen », parfois réduite à « 20 min ». On l'analyse au lieu de
 * réécrire les données, pour préserver la parité avec le document source.
 */
export function exoMeta(exo: Exo): ExoMeta {
  const parts = exo.diff.split("·").map((p) => p.trim());
  const duration = parts.find((p) => /min/i.test(p)) ?? null;
  const level = parts.find((p): p is Level =>
    LEVELS.includes(p as Level),
  ) ?? null;
  return { duration, level };
}

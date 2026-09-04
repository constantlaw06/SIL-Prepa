import { PLAN, PLAN_LEN } from "@/data/plan";

export const EXAM_STORAGE_KEY = "sil_exam";

/**
 * Date de l'examen par défaut : session du 29 septembre 2026.
 * Valeur constante (et non « aujourd'hui + 24 jours ») pour que le rendu
 * statique et l'hydratation partent du même point. Modifiable dans la barre
 * supérieure, le choix est alors mémorisé dans le navigateur.
 */
export const DEFAULT_EXAM_DATE = "2026-09-29";

export function defaultExamDate() {
  return DEFAULT_EXAM_DATE;
}

export function daysLeft(examISO: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exam = new Date(examISO + "T00:00:00");
  if (Number.isNaN(exam.getTime())) return 0;
  return Math.round((exam.getTime() - now.getTime()) / 86_400_000);
}

/** Jour courant du plan (1..PLAN_LEN), ou null hors de la fenêtre de révision. */
export function currentPlanDay(examISO: string) {
  const left = daysLeft(examISO);
  return left >= 0 && left <= PLAN_LEN ? PLAN_LEN - left + 1 : null;
}

/**
 * Nombre de jours avant l'entrée dans le plan, quand l'examen est encore
 * au-delà de la fenêtre de PLAN_LEN jours. 0 si le plan a déjà commencé.
 */
export function daysBeforePlanStart(examISO: string) {
  const left = daysLeft(examISO);
  return left > PLAN_LEN ? left - PLAN_LEN : 0;
}

/** Clé du thème planifié pour la journée en cours, s'il y en a un. */
export function themeOfTheDay(planDay: number | null) {
  if (planDay === null) return null;
  return PLAN.find((p) => p.d === planDay)?.k ?? null;
}

/** Date d'examen en toutes lettres : « 29 septembre 2026 ». */
export function formatExamDate(examISO: string) {
  const d = new Date(examISO + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "date invalide";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

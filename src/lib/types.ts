export type QuestionType = "qcm" | "multi" | "vf" | "short";

/** QCM à une seule bonne réponse : `a` est l'index de l'option correcte. */
export type QcmQuestion = {
  type: "qcm";
  q: string;
  o: string[];
  a: number;
  e: string;
};

/** QCM à plusieurs bonnes réponses : `a` est la liste des index corrects. */
export type MultiQuestion = {
  type: "multi";
  q: string;
  o: string[];
  a: number[];
  e: string;
};

export type VraiFauxQuestion = {
  type: "vf";
  q: string;
  a: boolean;
  e: string;
};

/** Question ouverte : `a` est la réponse modèle, non notée automatiquement. */
export type ShortQuestion = {
  type: "short";
  q: string;
  a: string;
  e: string;
};

export type Question =
  QcmQuestion | MultiQuestion | VraiFauxQuestion | ShortQuestion;

export type Theme = {
  title: string;
  qs: Question[];
};

export type Bank = Record<string, Theme>;

/** Une entrée du plan est soit un intertitre de phase, soit une journée. */
export type PlanItem =
  | { ph: string; d?: never; t?: never; k?: never; s?: never }
  | { ph?: never; d: number; t: string; k: string; s: string };

export type Exo = {
  cat: string;
  diff: string;
  titre: string;
  enonce: string;
  corrige: string;
};

/** Réponse saisie par l'utilisateur : index (qcm), indices (multi), "true"/"false" (vf). */
export type Answer = number | number[] | string | undefined;

import type { PlanItem } from "@/lib/types";

export const PLAN_LEN = 24;

export const PLAN: PlanItem[] = [
  { ph: "Phase 1 · Diagnostic & apprentissage" },
  {
    d: 1,
    t: "Examen blanc diagnostic",
    k: "blanc1",
    s: "Repère tes points faibles",
  },
  {
    d: 2,
    t: "Numération & conversions",
    k: "num",
    s: "Binaire, hexa, octal, BCD",
  },
  {
    d: 3,
    t: "Architecture des ordinateurs",
    k: "archi",
    s: "Von Neumann, cache, mémoire",
  },
  { d: 4, t: "Réseaux & sous-réseautage", k: "res", s: "Classes IP, masques" },
  { d: 5, t: "Modélisation UML", k: "uml", s: "Cas d'utilisation, classes" },
  {
    d: 6,
    t: "Bases de données (MCD → relationnel)",
    k: "bd",
    s: "Entité-association, clés",
  },
  { d: 7, t: "SQL", k: "sql", s: "SELECT, jointures, agrégats" },
  { d: 8, t: "POO - Java / C++", k: "poo", s: "Classes, héritage, tableaux" },
  { d: 9, t: "PHP", k: "php", s: "Syntaxe, superglobales" },
  {
    d: 10,
    t: "HTML / CSS / Bootstrap",
    k: "web",
    s: "Balises, grille, sélecteurs",
  },
  { d: 11, t: "Tableur Excel", k: "excel", s: "Formules & fonctions" },
  { ph: "Phase 2 · Reprise espacée" },
  { d: 12, t: "Examen blanc - Tronc Commun", k: "blanc2", s: "Chrono 2 h" },
  {
    d: 13,
    t: "Numération + Architecture (reprise)",
    k: "archi",
    s: "Referme les lacunes",
  },
  { d: 14, t: "Réseaux (reprise)", k: "res", s: "Subnetting sans notes" },
  { d: 15, t: "UML (reprise)", k: "uml", s: "Diagramme de classes complet" },
  { d: 16, t: "BD + SQL (reprise)", k: "sql", s: "Requêtes complexes" },
  { d: 17, t: "POO (reprise)", k: "poo", s: "Écrire une classe complète" },
  { d: 18, t: "PHP + Web (reprise)", k: "php", s: "Formulaire + traitement" },
  { ph: "Phase 3 · Finition" },
  { d: 19, t: "Examen blanc - Spécialité", k: "blanc3", s: "Chrono 2 h" },
  { d: 20, t: "Points faibles ciblés", k: "blanc1", s: "Refais ce qui coince" },
  {
    d: 21,
    t: "Réseaux + SQL (les plus rentables)",
    k: "res",
    s: "Points sûrs",
  },
  { d: 22, t: "Examen blanc complet", k: "blanc2", s: "Simulation finale" },
  {
    d: 23,
    t: "Relecture fiches + carnet d'erreurs",
    k: "num",
    s: "Révision légère",
  },
  {
    d: 24,
    t: "Repos actif - relecture fiches",
    k: "web",
    s: "On n'apprend plus rien de neuf",
  },
];

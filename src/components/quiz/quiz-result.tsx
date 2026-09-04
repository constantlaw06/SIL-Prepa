"use client";

import {
  ArrowPathIcon,
  ArrowRightIcon,
  BookOpenIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { MASTERY_TARGET, stateOf } from "@/lib/mastery";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Nombre de bonnes réponses supplémentaires pour atteindre l'objectif. */
function missingAnswers(score: number, gradable: number) {
  if (gradable === 0) return 0;
  const needed = Math.ceil((MASTERY_TARGET / 100) * gradable);
  return Math.max(0, needed - score);
}

/**
 * Écran de résultat : le score, sa lecture, les lacunes précises, puis la
 * prochaine action. Une note seule ne dit pas quoi travailler.
 */
export function QuizResult({
  themeKey,
  themeTitle,
  questions,
  score,
  gradable,
  pct,
  wrong,
  onRetry,
  onReview,
}: {
  themeKey: string;
  themeTitle: string;
  questions: Question[];
  score: number;
  gradable: number;
  pct: number;
  wrong: number[];
  onRetry: () => void;
  onReview: () => void;
}) {
  const reached = pct >= MASTERY_TARGET;
  const missing = missingAnswers(score, gradable);
  const openQuestions = questions.filter((q) => q.type === "short").length;

  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Résultat · {themeTitle}</p>
          <p
            className={cn(
              "mt-1 text-4xl font-extrabold tabular-nums",
              reached ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive",
            )}
          >
            {pct} %
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium text-success">{score} bonnes réponses</span>
            {" · "}
            <span className="font-medium text-destructive">
              {gradable - score} erreur{gradable - score > 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground"> sur {gradable} notées</span>
          </p>
        </div>
        <StatusBadge state={stateOf({ theme: themeKey, score, gradable, pct, at: "" })} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progression vers l&apos;objectif</span>
          <span className="tabular-nums">
            {pct} % / {MASTERY_TARGET} %
          </span>
        </div>
        <Progress value={pct} />
      </div>

      <p className="mt-3 text-sm">
        {reached
          ? "Objectif atteint. Ce thème est acquis : reviens-y dans quelques jours pour l'entretenir."
          : missing > 0
            ? `Il te manque ${missing} bonne${missing > 1 ? "s" : ""} réponse${missing > 1 ? "s" : ""} pour atteindre l'objectif de ${MASTERY_TARGET} %.`
            : `Tu es à ${pct} %, sous l'objectif de ${MASTERY_TARGET} %.`}
      </p>

      {wrong.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold">Tes lacunes sur cette série</h3>
          <ul className="mt-2 space-y-1.5">
            {wrong.slice(0, 5).map((index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs text-destructive">
                  Q{index + 1}
                </span>
                <span
                  className="line-clamp-2 text-muted-foreground"
                  // Les énoncés contiennent du HTML pédagogique rédigé dans le dépôt.
                  dangerouslySetInnerHTML={{
                    __html: questions[index].q,
                  }}
                />
              </li>
            ))}
          </ul>
          {wrong.length > 5 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              et {wrong.length - 5} autre{wrong.length - 5 > 1 ? "s" : ""} question
              {wrong.length - 5 > 1 ? "s" : ""} ratée
              {wrong.length - 5 > 1 ? "s" : ""}.
            </p>
          )}
        </div>
      )}

      {openQuestions > 0 && (
        <p className="mt-4 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          {openQuestions} question{openQuestions > 1 ? "s" : ""} ouverte
          {openQuestions > 1 ? "s" : ""} ne compte{openQuestions > 1 ? "nt" : ""} pas
          dans la note : compare ta rédaction à la réponse modèle plus bas.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onReview} className="sm:flex-1">
          <EyeIcon aria-hidden="true" />
          Revoir mes erreurs
        </Button>
        <Button variant="outline" onClick={onRetry} className="sm:flex-1">
          <ArrowPathIcon aria-hidden="true" />
          Refaire le quiz
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          href="/fiches"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <BookOpenIcon aria-hidden="true" className="size-4" />
          Consulter la fiche du thème
        </Link>
        <Link
          href="/erreurs"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowRightIcon aria-hidden="true" className="size-4" />
          Voir tout mon carnet d&apos;erreurs
        </Link>
      </div>
    </section>
  );
}

"use client";

import {
  ArrowLeftIcon,
  ClockIcon,
  ListBulletIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { MASTERY_TARGET } from "@/lib/mastery";
import type { ThemeProgress } from "@/lib/mastery";
import { TYPE_LABEL } from "@/lib/quiz";
import type { Question } from "@/lib/types";

function typeBreakdown(questions: Question[]) {
  const counts = new Map<string, number>();
  for (const q of questions) {
    counts.set(TYPE_LABEL[q.type], (counts.get(TYPE_LABEL[q.type]) ?? 0) + 1);
  }
  return [...counts.entries()];
}

/**
 * Écran d'avant-quiz : il répond à « qu'est-ce que je m'apprête à faire, où
 * j'en suis, et combien de temps ça va me prendre » avant de lancer la série.
 */
export function QuizIntro({
  progress,
  questions,
  onStart,
}: {
  progress: ThemeProgress;
  questions: Question[];
  onStart: () => void;
}) {
  const last = progress.result;

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href="/quiz"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4 shrink-0" />
        Tous les thèmes
      </Link>

      <div className="mt-3 rounded-lg border border-border bg-card p-5 sm:p-6">
        <StatusBadge state={progress.state} score={progress.pct} />

        <h2 className="mt-3 text-xl font-bold sm:text-2xl">{progress.title}</h2>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ListBulletIcon aria-hidden="true" className="size-4" />
            {progress.questionCount} questions
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon aria-hidden="true" className="size-4" />
            environ {progress.minutes} min
          </span>
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {typeBreakdown(questions).map(([label, n]) => (
            <li key={label}>
              {n} × {label}
            </li>
          ))}
        </ul>

        {last ? (
          <div className="mt-5 rounded-md border border-border bg-secondary/40 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground">Dernier score</span>
              <span className="text-lg font-bold tabular-nums">{last.pct} %</span>
            </div>
            <Progress value={last.pct} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {progress.gap > 0
                ? `Objectif ${MASTERY_TARGET} % : il te manque ${progress.gap} points.`
                : `Objectif ${MASTERY_TARGET} % atteint. Refais la série pour l'entretenir.`}
            </p>
          </div>
        ) : (
          <p className="mt-5 rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Tu n&apos;as pas encore fait cette série. Ce premier passage sert à
            situer ton niveau : réponds sans tes notes.
          </p>
        )}

        <Button size="lg" className="mt-5 w-full" onClick={onStart}>
          <PlayIcon aria-hidden="true" />
          {last ? "Refaire la série" : "Commencer le quiz"}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Les questions ouvertes ne sont pas notées automatiquement : tu compares
          ta réponse au corrigé.
        </p>
      </div>
    </section>
  );
}

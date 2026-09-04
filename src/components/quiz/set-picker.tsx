"use client";

import { ArrowLeftIcon, ClockIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { useResults } from "@/hooks/use-results";
import { setProgressOf } from "@/lib/mastery";
import type { QuizSet } from "@/lib/quiz-sets";
import { setHref } from "@/lib/quiz-sets";

/**
 * Sélecteur de questionnaire pour les thèmes découpés en plusieurs séries
 * (au-delà de 15 questions). Chaque série est un quiz indépendant, avec sa
 * propre progression.
 */
export function SetPicker({ sets, themeTitle }: { sets: QuizSet[]; themeTitle: string }) {
  const { results } = useResults();
  const progresses = useMemo(
    () => sets.map((s) => setProgressOf(s, results)),
    [sets, results],
  );

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href="/quiz"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4 shrink-0" />
        Tous les thèmes
      </Link>

      <h2 className="mt-3 text-xl font-bold sm:text-2xl">{themeTitle}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Ce thème compte {sets.length} questionnaires de {sets[0]?.qs.length ?? 0}{" "}
        questions environ chacun. Progresse série par série.
      </p>

      <ul className="mt-4 space-y-3">
        {sets.map((set, i) => {
          const p = progresses[i];
          return (
            <li key={set.id}>
              <Link
                href={setHref(set)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Série {set.setNumber}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ListBulletIcon aria-hidden="true" className="size-3.5" />
                      {p.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon aria-hidden="true" className="size-3.5" />
                      {p.minutes} min
                    </span>
                  </p>
                </div>
                <StatusBadge state={p.state} score={p.pct} className="shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

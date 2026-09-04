"use client";

import { ClockIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { BANK } from "@/data/bank";
import { useResults } from "@/hooks/use-results";
import { MASTERY_TARGET, globalProgress } from "@/lib/mastery";
import type { ResourceState } from "@/lib/mastery";

const GROUPS: { state: ResourceState; title: string; hint: string }[] = [
  {
    state: "review",
    title: "À reprendre",
    hint: "score en dessous de 50 %, c'est le plus rentable",
  },
  {
    state: "in-progress",
    title: "En cours",
    hint: `commencé mais sous l'objectif de ${MASTERY_TARGET} %`,
  },
  { state: "new", title: "À découvrir", hint: "jamais travaillé" },
  { state: "mastered", title: "Maîtrisé", hint: "à entretenir de temps en temps" },
];

export function ThemeGrid() {
  const { results } = useResults();
  const progress = useMemo(() => globalProgress(BANK, results), [results]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {progress.total} thèmes, {progress.questionsTotal} questions. Objectif :
        dépasser {MASTERY_TARGET} % sur chacun. Les thèmes sont regroupés par ce
        qu&apos;ils te demandent maintenant.
      </p>

      {GROUPS.map((group) => {
        const themes = progress.themes.filter((t) => t.state === group.state);
        if (themes.length === 0) return null;

        return (
          <section key={group.state}>
            <h2 className="mb-1 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
              {group.title}
              <span className="text-xs font-normal text-muted-foreground">
                {themes.length} · {group.hint}
              </span>
            </h2>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {themes.map((theme) => (
                <li key={theme.key}>
                  <Link
                    href={`/quiz/${theme.key}`}
                    className="flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold">{theme.title}</span>
                      {theme.setCount > 1 && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {theme.setCount} séries
                        </span>
                      )}
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ListBulletIcon aria-hidden="true" className="size-3.5" />
                        {theme.questionCount} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon aria-hidden="true" className="size-3.5" />
                        {theme.minutes} min
                      </span>
                    </span>

                    <span className="mt-3">
                      <StatusBadge state={theme.state} score={theme.pct} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

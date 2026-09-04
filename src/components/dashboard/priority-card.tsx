"use client";

import {
  ClockIcon,
  ListBulletIcon,
  PlayIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { MASTERY_TARGET } from "@/lib/mastery";
import type { Recommendation } from "@/lib/mastery";

/**
 * Bloc dominant du tableau de bord : une seule action, avec la raison de ce
 * choix. C'est la réponse à « qu'est-ce que je fais maintenant ».
 */
export function PriorityCard({
  recommendation,
}: {
  recommendation: Recommendation | null;
}) {
  if (!recommendation) {
    return (
      <section className="rounded-lg border border-success/40 bg-success/5 p-5">
        <div className="flex items-start gap-3">
          <TrophyIcon
            aria-hidden="true"
            className="mt-0.5 size-6 shrink-0 text-success"
          />
          <div>
            <h2 className="text-lg font-bold">Tous les thèmes sont maîtrisés</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Passe aux exercices rédigés et aux examens blancs en conditions
              réelles : c&apos;est ce qui te reste à travailler.
            </p>
            <Button asChild className="mt-4">
              <Link href="/exercices">Ouvrir les exercices</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const { theme, reason } = recommendation;

  return (
    <section className="rounded-lg border-2 border-primary/50 bg-primary/5 p-5">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">
        Ta priorité aujourd&apos;hui
      </p>

      <h2 className="mt-2 text-xl font-bold sm:text-2xl">{theme.title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{reason}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <StatusBadge state={theme.state} score={theme.pct} />
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ListBulletIcon aria-hidden="true" className="size-4" />
          {theme.questionCount} questions
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ClockIcon aria-hidden="true" className="size-4" />
          environ {theme.minutes} min
        </span>
      </div>

      {theme.pct !== null && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Score actuel</span>
            <span className="tabular-nums">
              {theme.pct} % · objectif {MASTERY_TARGET} %
            </span>
          </div>
          <Progress value={theme.pct} />
        </div>
      )}

      <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
        <Link href={`/quiz/${theme.key}`}>
          <PlayIcon aria-hidden="true" />
          {theme.result ? "Reprendre ce thème" : "Commencer"}
        </Link>
      </Button>
    </section>
  );
}

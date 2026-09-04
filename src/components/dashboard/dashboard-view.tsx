"use client";

import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  LinkIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";

import { PriorityCard } from "@/components/dashboard/priority-card";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { BANK } from "@/data/bank";
import { EXOS } from "@/data/exos";
import { PLAN, PLAN_LEN } from "@/data/plan";
import { useExamDate } from "@/hooks/use-exam-date";
import { useResults } from "@/hooks/use-results";
import {
  currentPlanDay,
  daysBeforePlanStart,
  daysLeft,
  formatExamDate,
  themeOfTheDay,
} from "@/lib/exam-date";
import { MASTERY_TARGET, globalProgress, recommend } from "@/lib/mastery";
import { cn } from "@/lib/utils";

/** Une statistique du bandeau « où j'en suis », toujours explicitée. */
function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-sm">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const SECONDARY_LINKS = [
  { href: "/plan", label: "Plan de révision", icon: CalendarDaysIcon },
  { href: "/exercices", label: "Exercices rédigés", icon: PuzzlePieceIcon },
  { href: "/fiches", label: "Fiches express", icon: BookOpenIcon },
  { href: "/methode", label: "Méthode", icon: LightBulbIcon },
  { href: "/ressources", label: "Ressources", icon: LinkIcon },
];

export function DashboardView() {
  const { exam, ready } = useExamDate();
  const { results } = useResults();

  const left = daysLeft(exam);
  const planDay = currentPlanDay(exam);
  const beforeStart = daysBeforePlanStart(exam);
  const dayPlan = planDay ? PLAN.find((p) => p.d === planDay) : undefined;

  const progress = useMemo(() => globalProgress(BANK, results), [results]);
  const recommendation = useMemo(
    () => recommend(progress, themeOfTheDay(planDay)),
    [progress, planDay],
  );

  const chartPoints = results.history.slice(-10).map((h) => ({
    label: new Date(h.at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: h.pct,
  }));

  const globalPct = Math.round((progress.mastered / progress.total) * 100);

  return (
    <div className="space-y-6">
      {/* A. Situation actuelle */}
      <section>
        <h2 className="sr-only">Où j&apos;en suis</h2>

        <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-lg font-semibold">
            {ready ? (
              left >= 0 ? (
                <>
                  Examen dans{" "}
                  <span className={cn(left <= 7 && "text-destructive")}>
                    {left} jour{left > 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                "Date d'examen dépassée"
              )
            ) : (
              "Chargement…"
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {ready && `${formatExamDate(exam)}`}
            {ready && planDay && ` · jour ${planDay} du plan sur ${PLAN_LEN}`}
            {ready && !planDay && beforeStart > 0 && ` · le plan démarre dans ${beforeStart} j`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            value={`${progress.started}/${progress.total}`}
            label="thèmes commencés"
            hint={
              progress.started === 0 ? "aucun thème travaillé" : "sur le programme"
            }
          />
          <Stat
            value={`${progress.questionsAnswered}/${progress.questionsTotal}`}
            label="questions couvertes"
            hint="sur toute la banque"
          />
          <Stat
            value={`${progress.mastered}/${progress.total}`}
            label="thèmes maîtrisés"
            hint={`score ≥ ${MASTERY_TARGET} %`}
          />
          <Stat
            value={progress.averagePct === null ? "-" : `${progress.averagePct} %`}
            label="score moyen"
            hint={
              progress.averagePct === null
                ? "aucune série corrigée"
                : "sur les thèmes travaillés"
            }
          />
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progression globale (thèmes maîtrisés)</span>
            <span className="tabular-nums">{globalPct} %</span>
          </div>
          <Progress value={globalPct} />
        </div>
      </section>

      {/* B. Action prioritaire */}
      <PriorityCard recommendation={recommendation} />

      {ready && dayPlan && planDay && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-secondary/40 px-3.5 py-2.5 text-sm">
          <CalendarDaysIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="text-muted-foreground">Au programme du jour {planDay} :</span>
          <span className="font-medium">{dayPlan.t}</span>
          <Link href="/plan" className="ml-auto text-primary hover:underline">
            Voir le plan
          </Link>
        </p>
      )}

      {/* C + D. Faiblesses et progression */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-border bg-card p-4 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Progression des scores</h2>
            <span className="text-xs text-muted-foreground">
              {results.history.length} série
              {results.history.length > 1 ? "s" : ""} corrigée
              {results.history.length > 1 ? "s" : ""}
            </span>
          </div>
          {chartPoints.length > 0 ? (
            <ScoreChart points={chartPoints} />
          ) : (
            <EmptyState
              icon={ChartBarIcon}
              title="Tu n'as pas encore terminé de quiz"
              description="Corrige une première série pour établir ton niveau de départ et voir ta courbe de progression."
              action={{ href: "/quiz", label: "Commencer un quiz" }}
            />
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Mes points faibles</h2>
            {progress.totalWrong > 0 && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {progress.totalWrong} erreur{progress.totalWrong > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {progress.weak.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {progress.started === 0
                ? "Tes points faibles apparaîtront ici dès ta première série corrigée."
                : "Aucun thème sous l'objectif parmi ceux que tu as travaillés."}
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {progress.weak.slice(0, 5).map((theme) => (
                  <li key={theme.key}>
                    <Link
                      href={`/quiz/${theme.key}`}
                      className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 p-2.5 transition-colors hover:border-primary"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {theme.title}
                        </span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-secondary">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              (theme.pct ?? 0) < 50 ? "bg-destructive" : "bg-warning",
                            )}
                            style={{ width: `${theme.pct ?? 0}%` }}
                          />
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {theme.pct} %
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href="/erreurs">
                  <ExclamationTriangleIcon aria-hidden="true" />
                  Revoir mes erreurs
                </Link>
              </Button>
            </>
          )}
        </section>
      </div>

      {/* E. Contenu secondaire */}
      <section>
        <h2 className="mb-3 text-base font-semibold">Le reste du programme</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {SECONDARY_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary"
            >
              <Icon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">{label}</span>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {EXOS.length} exercices rédigés et {progress.questionsTotal} questions au
          total dans la banque.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-base font-semibold">Tous les thèmes</h2>
        <ul className="space-y-2">
          {progress.themes.map((theme) => (
            <li key={theme.key}>
              <Link
                href={`/quiz/${theme.key}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md p-2 transition-colors hover:bg-accent"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{theme.title}</span>
                <StatusBadge state={theme.state} score={theme.pct} />
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <AcademicCapIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        Objectif : dépasser {MASTERY_TARGET} % sur chaque thème, puis rédiger les
        exercices sans les notes.
      </p>
    </div>
  );
}

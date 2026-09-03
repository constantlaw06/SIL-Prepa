"use client";

import {
  AcademicCapIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PuzzlePieceIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { AlertBanner } from "@/components/dashboard/alert-banner";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { Badge } from "@/components/ui/badge";
import { BANK } from "@/data/bank";
import { EXOS } from "@/data/exos";
import { PLAN, PLAN_LEN } from "@/data/plan";
import { useExamDate } from "@/hooks/use-exam-date";
import { useResults } from "@/hooks/use-results";
import {
  currentPlanDay,
  daysBeforePlanStart,
  daysLeft,
  themeOfTheDay,
} from "@/lib/exam-date";
import { cn } from "@/lib/utils";

const QUESTION_TOTAL = Object.values(BANK).reduce((n, t) => n + t.qs.length, 0);

function scoreTone(pct: number) {
  if (pct >= 80) return "text-success";
  if (pct >= 50) return "text-warning";
  return "text-destructive";
}

function Panel({
  title,
  action,
  badge,
  children,
  className,
}: {
  title: string;
  action?: { href: string; label: string };
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="flex-1 text-base font-semibold">{title}</h2>
        {badge && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {badge}
          </span>
        )}
        {action && (
          <Link
            href={action.href}
            className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            {action.label}
            <ChevronRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function DashboardView() {
  const { exam, ready } = useExamDate();
  const { results } = useResults();

  const left = daysLeft(exam);
  const planDay = currentPlanDay(exam);
  const dayTheme = themeOfTheDay(planDay);
  const dayPlan = planDay ? PLAN.find((p) => p.d === planDay) : undefined;
  const beforeStart = daysBeforePlanStart(exam);

  const planSub = planDay
    ? `Jour ${planDay} sur ${PLAN_LEN}`
    : beforeStart > 0
      ? `Le plan démarre dans ${beforeStart} jour${beforeStart > 1 ? "s" : ""}`
      : "Plan terminé";

  const themes = Object.entries(BANK).map(([key, theme]) => ({
    key,
    title: theme.title,
    count: theme.qs.length,
    result: results.last[key] ?? null,
  }));

  const attempted = themes.filter((t) => t.result);
  const mastered = attempted.filter((t) => t.result!.pct >= 80);
  const weak = attempted.filter((t) => t.result!.pct < 50);
  const never = themes.filter((t) => !t.result);
  const avg = attempted.length
    ? Math.round(attempted.reduce((n, t) => n + t.result!.pct, 0) / attempted.length)
    : null;

  const { history } = results;
  const trend =
    history.length >= 2
      ? history[history.length - 1].pct - history[history.length - 2].pct
      : null;

  const chartPoints = history.slice(-10).map((h) => ({
    label: new Date(h.at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: h.pct,
  }));

  const questionsDone = attempted.reduce((n, t) => n + t.count, 0);

  // File des séries à reprendre : les plus faibles d'abord, puis les inédites.
  const todo = [
    ...attempted
      .filter((t) => t.result!.pct < 80)
      .sort((a, b) => a.result!.pct - b.result!.pct),
    ...never,
  ].slice(0, 5);

  const exoCats = Array.from(new Set(EXOS.map((e) => e.cat))).map((cat) => ({
    cat,
    count: EXOS.filter((e) => e.cat === cat).length,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={CalendarDaysIcon}
          label="Jours avant l'examen"
          value={ready ? String(Math.max(0, left)) : "..."}
          sub={ready ? planSub : "Chargement"}
          tone={ready && left <= 7 ? "destructive" : "default"}
        />
        <KpiCard
          icon={ClipboardDocumentListIcon}
          label="Thèmes travaillés"
          value={`${attempted.length}/${themes.length}`}
          sub={`${questionsDone}/${QUESTION_TOTAL} questions couvertes`}
        />
        <KpiCard
          icon={ChartBarIcon}
          label="Score moyen"
          value={avg === null ? "-" : `${avg}%`}
          sub={avg === null ? "Aucune série corrigée" : "sur les derniers passages"}
          trend={trend}
          tone={avg === null ? "default" : avg >= 80 ? "success" : "warning"}
        />
        <KpiCard
          icon={CheckBadgeIcon}
          label="Thèmes maîtrisés"
          value={`${mastered.length}/${themes.length}`}
          sub="score supérieur ou égal à 80%"
          tone={mastered.length > 0 ? "success" : "default"}
        />
        <KpiCard
          icon={ArrowPathIcon}
          label="Séries corrigées"
          value={String(history.length)}
          sub={`${EXOS.length} exercices disponibles`}
        />
      </div>

      <div className="space-y-2">
        {weak.length > 0 && (
          <AlertBanner
            tone="danger"
            icon={ExclamationTriangleIcon}
            action={{ href: `/quiz/${weak[0].key}`, label: "Refaire" }}
          >
            {weak.length} thème{weak.length > 1 ? "s" : ""} sous 50% :{" "}
            {weak.map((t) => t.title).join(", ")}
          </AlertBanner>
        )}

        {ready && dayPlan && dayTheme && (
          <AlertBanner
            tone="warning"
            icon={ClockIcon}
            action={{ href: `/quiz/${dayTheme}`, label: "Réviser" }}
          >
            Programme du jour {planDay} : {dayPlan.t}
          </AlertBanner>
        )}

        {never.length > 0 && (
          <AlertBanner
            tone="info"
            icon={SparklesIcon}
            action={{ href: `/quiz/${never[0].key}`, label: "Commencer" }}
          >
            {never.length} thème{never.length > 1 ? "s" : ""} jamais tenté
            {never.length > 1 ? "s" : ""} sur {themes.length}
          </AlertBanner>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="Progression des scores"
          action={{ href: "/quiz", label: "Lancer une série" }}
          className="xl:col-span-2"
        >
          {chartPoints.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-1" />
                Score par série
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-px w-4 border-t-2 border-dashed border-success" />
                Objectif 80%
              </span>
              <span className="text-muted-foreground">
                {history.length} série{history.length > 1 ? "s" : ""} enregistrée
                {history.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <ScoreChart points={chartPoints} />
        </Panel>

        <Panel title="À reprendre" badge={String(todo.length)}>
          {todo.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tous les thèmes sont au-dessus de 80%. Enchaîne sur les exercices
              rédigés.
            </p>
          ) : (
            <ul className="space-y-2">
              {todo.map((t) => (
                <li key={t.key}>
                  <Link
                    href={`/quiz/${t.key}`}
                    className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {t.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t.count} questions
                      </span>
                    </span>
                    {t.result ? (
                      <Badge
                        variant="secondary"
                        className={cn("shrink-0", scoreTone(t.result.pct))}
                      >
                        {t.result.pct}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        inédit
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/plan"
            className="mt-3 flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            Voir le plan complet
            <ChevronRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="Programme par thème"
          action={{ href: "/quiz", label: "Tous les thèmes" }}
          className="xl:col-span-2"
        >
          <ul className="space-y-2.5">
            {themes.map((t) => {
              const pct = t.result?.pct ?? 0;
              return (
                <li key={t.key} className="flex items-center gap-3">
                  <Link
                    href={`/quiz/${t.key}`}
                    className="w-52 shrink-0 truncate text-sm hover:text-primary"
                  >
                    {t.title}
                  </Link>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        pct >= 80
                          ? "bg-success"
                          : pct >= 50
                            ? "bg-warning"
                            : pct > 0
                              ? "bg-destructive"
                              : "bg-transparent",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "w-14 shrink-0 text-right text-xs tabular-nums",
                      t.result ? scoreTone(pct) : "text-muted-foreground",
                    )}
                  >
                    {t.result ? `${pct}%` : "-"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Exercices rédigés"
            action={{ href: "/exercices", label: "Ouvrir" }}
          >
            <ul className="space-y-2">
              {exoCats.map((c) => (
                <li
                  key={c.cat}
                  className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <PuzzlePieceIcon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    {c.cat}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {c.count} sujets
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Méthode" action={{ href: "/methode", label: "Lire" }}>
            <div className="flex items-start gap-3">
              <AcademicCapIcon
                aria-hidden="true"
                className="size-8 shrink-0 rounded-md bg-primary/12 p-1.5 text-primary"
              />
              <p className="text-sm text-muted-foreground">
                Refais chaque série jusqu&apos;à dépasser 80%, puis rédige les
                exercices sans les notes. Les questions ouvertes ne sont pas notées :
                compare ta réponse au corrigé.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

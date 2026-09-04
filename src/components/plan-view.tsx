"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { BANK } from "@/data/bank";
import { PLAN, PLAN_LEN } from "@/data/plan";
import { useExamDate } from "@/hooks/use-exam-date";
import { useResults } from "@/hooks/use-results";
import { currentPlanDay, daysBeforePlanStart, formatExamDate } from "@/lib/exam-date";
import { themeProgress } from "@/lib/mastery";
import type { PlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DayState = "done" | "today" | "upcoming";

const MARKS: Record<DayState, string> = {
  done: "✓",
  today: "●",
  upcoming: "○",
};

const MARK_LABELS: Record<DayState, string> = {
  done: "Journée passée",
  today: "Aujourd'hui",
  upcoming: "À venir",
};

function dayState(day: number, today: number | null): DayState {
  if (today === null) return "upcoming";
  if (day < today) return "done";
  if (day === today) return "today";
  return "upcoming";
}

/**
 * Timeline du plan : phases, repères visuels par journée, et mise en avant de
 * la journée courante. Chaque état porte un symbole ET un libellé accessible.
 */
export function PlanView() {
  const { exam, ready } = useExamDate();
  const { results } = useResults();

  const today = ready ? currentPlanDay(exam) : null;
  const beforeStart = ready ? daysBeforePlanStart(exam) : 0;

  const progressByTheme = useMemo(() => {
    const map = new Map(themeProgress(BANK, results).map((t) => [t.key, t]));
    return map;
  }, [results]);

  // Le plan alterne intertitres de phase et journées : on regroupe pour la timeline.
  const phases = useMemo(() => {
    type Day = Extract<PlanItem, { d: number }>;
    const isDay = (item: PlanItem): item is Day => item.d !== undefined;

    const out: { title: string; days: Day[] }[] = [];
    for (const item of PLAN) {
      if (isDay(item)) out[out.length - 1]?.days.push(item);
      else out.push({ title: item.ph, days: [] });
    }
    return out;
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-muted-foreground">
          {ready ? (
            <>
              Examen le {formatExamDate(exam)}.{" "}
              {today
                ? `Tu es au jour ${today} sur ${PLAN_LEN}.`
                : beforeStart > 0
                  ? `Le plan démarre dans ${beforeStart} jour${beforeStart > 1 ? "s" : ""}.`
                  : "Le plan est terminé."}
            </>
          ) : (
            "Chargement…"
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Trois phases : diagnostic, reprise espacée, puis finition. L&apos;état
          affiché à droite est ta progression réelle sur le thème, pas ton
          avancement dans le calendrier.
        </p>
      </header>

      {phases.map((phase) => (
        <section key={phase.title}>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-warning uppercase">
            {phase.title}
          </h2>

          <ol className="space-y-1.5">
            {phase.days.map((item) => {
              const state = dayState(item.d, today);
              const theme = progressByTheme.get(item.k);
              const isToday = state === "today";

              return (
                <li
                  key={item.d}
                  className={cn(
                    "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border p-3",
                    isToday
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                      : "border-border bg-card",
                    state === "done" && "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
                      state === "done" && "border-success/40 bg-success/10 text-success",
                      isToday && "border-primary bg-primary text-primary-foreground",
                      state === "upcoming" && "border-border text-muted-foreground",
                    )}
                  >
                    <span aria-hidden="true">{MARKS[state]}</span>
                    <span className="sr-only">{MARK_LABELS[state]}</span>
                  </span>

                  <span className="w-9 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    J{item.d}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {item.t}
                      {isToday && (
                        <span className="ml-2 text-xs font-semibold text-primary">
                          Aujourd&apos;hui
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-muted-foreground">{item.s}</span>
                  </span>

                  {theme && (
                    <StatusBadge
                      state={theme.state}
                      score={theme.pct}
                      className="shrink-0"
                    />
                  )}

                  <Button
                    asChild
                    size="sm"
                    variant={isToday ? "default" : "outline"}
                    className="shrink-0"
                  >
                    <Link href={`/quiz/${item.k}`}>
                      {isToday ? "Réviser" : "Ouvrir"}
                      <ArrowRightIcon aria-hidden="true" />
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

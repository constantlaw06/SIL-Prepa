"use client";

import { CalendarIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useExamDate } from "@/hooks/use-exam-date";
import { daysLeft, formatExamDate } from "@/lib/exam-date";
import { cn } from "@/lib/utils";

/**
 * Source unique de la date d'examen : elle s'affiche en clair, et ne devient
 * un champ de saisie que si l'utilisateur demande à la modifier. Aucune autre
 * page ne redemande cette information.
 */
export function ExamDateControl() {
  const { exam, setExam, ready } = useExamDate();
  const [editing, setEditing] = useState(false);
  const left = daysLeft(exam);

  if (!ready) {
    return <span className="h-8 w-32 animate-pulse rounded-md bg-secondary" />;
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <label className="sr-only" htmlFor="exam-date">
          Date de l&apos;examen
        </label>
        <input
          id="exam-date"
          type="date"
          value={exam}
          autoFocus
          onChange={(e) => setExam(e.target.value)}
          className="h-8 rounded-md border border-input bg-secondary/60 px-2 text-xs text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
        />
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          <CheckIcon aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">OK</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          left <= 7
            ? "bg-destructive/15 text-destructive"
            : left <= 14
              ? "bg-warning/15 text-warning"
              : "bg-primary/15 text-primary",
        )}
      >
        <CalendarIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Examen : {formatExamDate(exam)} · </span>
        {left >= 0 ? `J-${left}` : "date dépassée"}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded px-1 py-0.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Modifier
        <span className="sr-only"> la date de l&apos;examen</span>
      </button>
    </div>
  );
}

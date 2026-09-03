"use client";

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

import { QuestionCard } from "@/components/question-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { scoreOf } from "@/lib/quiz";
import { recordResult } from "@/lib/results-store";
import type { Answer, Theme } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuizRunner({
  themeKey,
  theme,
}: {
  themeKey: string;
  theme: Theme;
}) {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [checked, setChecked] = useState(false);

  const { score, gradable, pct } = scoreOf(theme.qs, answers);

  // La correction fige le score : il alimente la progression du tableau de bord.
  const correct = () => {
    setChecked(true);
    recordResult({
      theme: themeKey,
      score,
      gradable,
      pct,
      at: new Date().toISOString(),
    });
  };

  const reset = () => {
    setAnswers({});
    setChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section>
      <Link
        href="/quiz"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4 shrink-0" />
        Retour aux thèmes
      </Link>

      <div className="mt-2 mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{theme.qs.length} questions</Badge>
        <span className="text-xs text-muted-foreground">
          Réponds à tout, puis corrige. Objectif : 80% minimum.
        </span>
      </div>

      <div className="space-y-4">
        {theme.qs.map((question, i) => (
          <QuestionCard
            key={i}
            question={question}
            index={i}
            answer={answers[i]}
            checked={checked}
            onAnswer={(value) =>
              setAnswers((prev) => ({ ...prev, [i]: value }))
            }
          />
        ))}
      </div>

      {checked && (
        <Card className="mt-4 gap-0 p-4 text-center">
          <div
            className={cn(
              "text-lg font-bold",
              pct >= 80
                ? "text-success"
                : pct >= 50
                  ? "text-warning"
                  : "text-destructive",
            )}
          >
            Score QCM / VF : {score}/{gradable} - {pct}%
          </div>
          <Progress value={pct} className="mt-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {pct >= 80
              ? "Maîtrisé. Passe au thème suivant."
              : "Refais cette série jusqu’à ≥ 80 %. Les questions-réponses sont à corriger toi-même."}
          </p>
        </Card>
      )}

      <div className="sticky bottom-0 mt-5 flex gap-3 bg-linear-to-t from-background to-transparent py-3">
        <Button size="lg" onClick={correct}>
          <CheckIcon aria-hidden="true" />
          Corriger
        </Button>
        <Button size="lg" variant="secondary" onClick={reset}>
          <ArrowPathIcon aria-hidden="true" />
          Recommencer
        </Button>
      </div>
    </section>
  );
}

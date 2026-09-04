"use client";

import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { QuestionCard } from "@/components/question-card";
import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizResult } from "@/components/quiz/quiz-result";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BANK } from "@/data/bank";
import { useResults } from "@/hooks/use-results";
import { themeProgress } from "@/lib/mastery";
import { isCorrect, scoreOf } from "@/lib/quiz";
import { recordResult } from "@/lib/results-store";
import type { Answer, Theme } from "@/lib/types";

type Phase = "intro" | "running" | "done";

export function QuizRunner({
  themeKey,
  theme,
}: {
  themeKey: string;
  theme: Theme;
}) {
  const { results } = useResults();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const questionsRef = useRef<HTMLDivElement>(null);

  const progress = useMemo(
    () => themeProgress(BANK, results).find((t) => t.key === themeKey)!,
    [results, themeKey],
  );

  const { score, gradable, pct } = scoreOf(theme.qs, answers);
  const checked = phase === "done";

  // Questions notées auxquelles l'utilisateur a effectivement répondu.
  const answeredCount = theme.qs.filter(
    (q, i) => q.type !== "short" && answers[i] !== undefined,
  ).length;

  const wrong = theme.qs
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => q.type !== "short" && !isCorrect(q, answers[i]))
    .map(({ i }) => i);

  const correct = () => {
    setPhase("done");
    recordResult({
      theme: themeKey,
      score,
      gradable,
      pct,
      at: new Date().toISOString(),
      wrong,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setAnswers({});
    setPhase("running");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (phase === "intro") {
    return (
      <QuizIntro
        progress={progress}
        questions={theme.qs}
        onStart={() => setPhase("running")}
      />
    );
  }

  return (
    <section>
      {checked ? (
        <QuizResult
          themeKey={themeKey}
          themeTitle={theme.title}
          questions={theme.qs}
          score={score}
          gradable={gradable}
          pct={pct}
          wrong={wrong}
          onRetry={restart}
          onReview={() =>
            questionsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
      ) : (
        <div className="sticky top-27 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:top-14 lg:-mx-6 lg:px-6">
          <div className="flex items-center justify-between gap-3 text-sm">
            <Link
              href="/quiz"
              className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Quitter</span>
            </Link>
            <span className="truncate font-medium">{theme.title}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {answeredCount}/{gradable} répondues
            </span>
          </div>
          <Progress
            value={gradable ? (answeredCount / gradable) * 100 : 0}
            className="mt-2 h-1.5"
          />
        </div>
      )}

      <div ref={questionsRef} className="mt-4 space-y-4 scroll-mt-44 lg:scroll-mt-32">
        {theme.qs.map((question, i) => (
          <QuestionCard
            key={i}
            question={question}
            index={i}
            total={theme.qs.length}
            answer={answers[i]}
            checked={checked}
            onAnswer={(value) => setAnswers((prev) => ({ ...prev, [i]: value }))}
          />
        ))}
      </div>

      {!checked && (
        <div className="sticky bottom-0 mt-5 flex flex-col gap-2 bg-linear-to-t from-background via-background to-transparent py-3 sm:flex-row">
          <Button size="lg" onClick={correct} className="sm:flex-1">
            <CheckIcon aria-hidden="true" />
            Corriger mes réponses
          </Button>
          {answeredCount < gradable && (
            <p className="self-center text-xs text-muted-foreground sm:order-first sm:mr-auto sm:self-center">
              {gradable - answeredCount} question
              {gradable - answeredCount > 1 ? "s" : ""} sans réponse
            </p>
          )}
        </div>
      )}

      {checked && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild className="sm:flex-1">
            <Link href="/quiz">Choisir un autre thème</Link>
          </Button>
          <Button variant="outline" asChild className="sm:flex-1">
            <Link href="/">Retour au tableau de bord</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

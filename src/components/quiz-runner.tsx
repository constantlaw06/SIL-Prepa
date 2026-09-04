"use client";

import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { QuestionCard } from "@/components/question-card";
import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizResult } from "@/components/quiz/quiz-result";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useResults } from "@/hooks/use-results";
import { setProgressOf } from "@/lib/mastery";
import type { QuizSet } from "@/lib/quiz-sets";
import { isCorrect, scoreOf } from "@/lib/quiz";
import { recordResult } from "@/lib/results-store";
import type { Answer } from "@/lib/types";

type Phase = "intro" | "running" | "done";

export function QuizRunner({ set }: { set: QuizSet }) {
  const { results } = useResults();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  /*
   * Les questions ouvertes ne peuvent pas être corrigées automatiquement :
   * l'étudiant se juge lui-même contre la réponse modèle. `null` = pas encore
   * jugée, pour ne jamais afficher une réponse ouverte comme correcte par
   * défaut.
   */
  const [openAssessed, setOpenAssessed] = useState<Record<number, boolean>>({});
  const correctedAtRef = useRef<string | null>(null);
  const questionsRef = useRef<HTMLDivElement>(null);

  const progress = useMemo(() => setProgressOf(set, results), [set, results]);

  const { score, gradable, pct } = scoreOf(set.qs, answers);
  const checked = phase === "done";

  // Questions notées auxquelles l'utilisateur a effectivement répondu.
  const answeredCount = set.qs.filter(
    (q, i) => q.type !== "short" && answers[i] !== undefined,
  ).length;

  const autoWrong = set.qs
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => q.type !== "short" && !isCorrect(q, answers[i]))
    .map(({ i }) => i);

  // Le carnet d'erreurs et le résumé du résultat reprennent aussi les
  // questions ouvertes que l'étudiant s'est lui-même jugées ratées.
  const openWrong = (indices: Record<number, boolean>) =>
    Object.entries(indices)
      .filter(([, correct]) => !correct)
      .map(([i]) => Number(i));

  const wrong = [...autoWrong, ...openWrong(openAssessed)].sort((a, b) => a - b);

  const correct = () => {
    setPhase("done");
    const at = new Date().toISOString();
    correctedAtRef.current = at;
    recordResult({ theme: set.id, score, gradable, pct, at, wrong: autoWrong });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selfAssess = (index: number, isCorrectAnswer: boolean) => {
    const next = { ...openAssessed, [index]: isCorrectAnswer };
    setOpenAssessed(next);
    // Met à jour la série déjà enregistrée : même score QCM/VF, mais le
    // carnet d'erreurs reflète désormais aussi cette question ouverte.
    if (correctedAtRef.current) {
      recordResult({
        theme: set.id,
        score,
        gradable,
        pct,
        at: correctedAtRef.current,
        wrong: [...autoWrong, ...openWrong(next)].sort((a, b) => a - b),
      });
    }
  };

  const restart = () => {
    setAnswers({});
    setOpenAssessed({});
    correctedAtRef.current = null;
    setPhase("running");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (phase === "intro") {
    return (
      <QuizIntro progress={progress} questions={set.qs} onStart={() => setPhase("running")} />
    );
  }

  return (
    <section>
      {checked ? (
        <QuizResult
          themeKey={set.id}
          themeTitle={set.title}
          questions={set.qs}
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
              href={set.setCount > 1 ? `/quiz/${set.themeKey}` : "/quiz"}
              className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Quitter</span>
            </Link>
            <span className="truncate font-medium">{set.title}</span>
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
        {set.qs.map((question, i) => (
          <QuestionCard
            key={i}
            question={question}
            index={i}
            total={set.qs.length}
            answer={answers[i]}
            checked={checked}
            onAnswer={(value) => setAnswers((prev) => ({ ...prev, [i]: value }))}
            selfAssessed={i in openAssessed ? openAssessed[i] : null}
            onSelfAssess={(isCorrectAnswer) => selfAssess(i, isCorrectAnswer)}
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
            <Link href={set.setCount > 1 ? `/quiz/${set.themeKey}` : "/quiz"}>
              {set.setCount > 1 ? "Autres séries de ce thème" : "Choisir un autre thème"}
            </Link>
          </Button>
          <Button variant="outline" asChild className="sm:flex-1">
            <Link href="/">Retour au tableau de bord</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

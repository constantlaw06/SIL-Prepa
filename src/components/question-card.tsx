"use client";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

import { RichText } from "@/components/rich-text";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TYPE_LABEL, isCorrect } from "@/lib/quiz";
import type { Answer, Question } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Couleur de bordure d'une option une fois la correction affichée. */
function optionState(checked: boolean, selected: boolean, correct: boolean) {
  if (!checked) return "border-border bg-secondary/40 hover:border-primary";
  if (correct) return "border-success bg-success/10";
  if (selected) return "border-destructive bg-destructive/10";
  return "border-border bg-secondary/40";
}

type OptionProps = {
  name: string;
  multiple?: boolean;
  selected: boolean;
  correct: boolean;
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
};

function Option({
  name,
  multiple,
  selected,
  correct,
  checked,
  onSelect,
  children,
}: OptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border p-2.5 transition-colors",
        optionState(checked, selected, correct),
      )}
    >
      <input
        type={multiple ? "checkbox" : "radio"}
        name={name}
        checked={selected}
        onChange={onSelect}
        className="accent-primary"
      />
      {children}
    </label>
  );
}

/**
 * Une question ouverte n'a pas de correction automatique fiable (texte
 * libre) : l'étudiant doit se corriger lui-même contre la réponse modèle.
 * Tant qu'il ne l'a pas fait, aucune couleur de succès ne doit apparaître -
 * sinon l'interface laisse croire à une bonne réponse par défaut.
 */
function SelfAssessment({
  selfAssessed,
  onSelfAssess,
}: {
  selfAssessed: boolean | null;
  onSelfAssess: (correct: boolean) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">
        As-tu répondu correctement ?
      </span>
      <button
        type="button"
        onClick={() => onSelfAssess(true)}
        aria-pressed={selfAssessed === true}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          selfAssessed === true
            ? "border-success bg-success/10 text-success"
            : "border-border text-muted-foreground hover:border-success/50 hover:text-success",
        )}
      >
        <CheckCircleIcon aria-hidden="true" className="size-3.5" />
        Oui, c&apos;était juste
      </button>
      <button
        type="button"
        onClick={() => onSelfAssess(false)}
        aria-pressed={selfAssessed === false}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          selfAssessed === false
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive",
        )}
      >
        <XCircleIcon aria-hidden="true" className="size-3.5" />
        Non, à revoir
      </button>
    </div>
  );
}

export type QuestionCardProps = {
  question: Question;
  index: number;
  /** Nombre total de questions, pour situer la progression. */
  total?: number;
  answer: Answer;
  checked: boolean;
  onAnswer: (value: Answer) => void;
  /**
   * Auto-évaluation d'une question ouverte : null tant que l'étudiant ne
   * s'est pas prononcé. Ignoré pour les autres types de question.
   */
  selfAssessed?: boolean | null;
  onSelfAssess?: (correct: boolean) => void;
};

export function QuestionCard({
  question,
  index,
  total,
  answer,
  checked,
  onAnswer,
  selfAssessed = null,
  onSelfAssess,
}: QuestionCardProps) {
  const name = `q${index}`;
  const ok = isCorrect(question, answer);

  return (
    <Card className="gap-0 p-4">
      <div className="mb-2 flex items-start gap-2">
        <Badge variant="secondary" className="mt-0.5 shrink-0">
          <span className="sr-only">Question </span>
          {index + 1}
          {total ? <span className="opacity-60">/{total}</span> : null}
        </Badge>
        <div>
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
            {TYPE_LABEL[question.type]}
          </div>
          <RichText as="div" html={question.q} className="font-medium" />
        </div>
      </div>

      {question.type === "qcm" && (
        <div className="mt-2 space-y-2">
          {question.o.map((option, j) => (
            <Option
              key={j}
              name={name}
              selected={answer === j}
              correct={j === question.a}
              checked={checked}
              onSelect={() => onAnswer(j)}
            >
              <RichText as="span" html={option} />
            </Option>
          ))}
        </div>
      )}

      {question.type === "multi" && (
        <div className="mt-2 space-y-2">
          {question.o.map((option, j) => {
            const current = Array.isArray(answer) ? answer : [];
            return (
              <Option
                key={j}
                name={name}
                multiple
                selected={current.includes(j)}
                correct={question.a.includes(j)}
                checked={checked}
                onSelect={() =>
                  onAnswer(
                    current.includes(j)
                      ? current.filter((v) => v !== j)
                      : [...current, j],
                  )
                }
              >
                <RichText as="span" html={option} />
              </Option>
            );
          })}
        </div>
      )}

      {question.type === "vf" && (
        <div className="mt-2 space-y-2">
          {(
            [
              ["true", "Vrai"],
              ["false", "Faux"],
            ] as const
          ).map(([value, label]) => (
            <Option
              key={value}
              name={name}
              selected={answer === value}
              correct={value === String(question.a)}
              checked={checked}
              onSelect={() => onAnswer(value)}
            >
              {label}
            </Option>
          ))}
        </div>
      )}

      {question.type === "short" && (
        <Textarea
          placeholder="Rédige ta réponse..."
          className="mt-2 min-h-[70px] resize-y bg-secondary/40"
          value={typeof answer === "string" ? answer : ""}
          onChange={(e) => onAnswer(e.target.value)}
        />
      )}

      {checked && (
        <Alert
          className={cn(
            "mt-3",
            question.type === "short"
              ? selfAssessed === true
                ? "border-success/40 bg-success/10"
                : selfAssessed === false
                  ? "border-destructive/40 bg-destructive/10"
                  : "border-border bg-muted/40"
              : ok
                ? "border-success/40 bg-success/10"
                : "border-destructive/40 bg-destructive/10",
          )}
        >
          <AlertDescription>
            {question.type === "short" ? (
              <div className="rich text-sm">
                <b className="text-foreground">Réponse modèle : </b>
                {question.a}
                <RichText
                  as="div"
                  html={question.e}
                  className="mt-1 text-muted-foreground"
                />
                {onSelfAssess && (
                  <SelfAssessment
                    selfAssessed={selfAssessed}
                    onSelfAssess={onSelfAssess}
                  />
                )}
              </div>
            ) : (
              <div className="rich flex gap-2 text-sm">
                {ok ? (
                  <CheckCircleIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-success"
                  />
                ) : (
                  <XCircleIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                  />
                )}
                <div>
                  <b className={ok ? "text-success" : "text-destructive"}>
                    {ok ? "Correct. " : "Revois. "}
                  </b>
                  <RichText as="span" html={question.e} />
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}

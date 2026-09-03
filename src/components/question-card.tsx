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

export type QuestionCardProps = {
  question: Question;
  index: number;
  answer: Answer;
  checked: boolean;
  onAnswer: (value: Answer) => void;
};

export function QuestionCard({
  question,
  index,
  answer,
  checked,
  onAnswer,
}: QuestionCardProps) {
  const name = `q${index}`;
  const ok = isCorrect(question, answer);

  return (
    <Card className="gap-0 p-4">
      <div className="mb-2 flex items-start gap-2">
        <Badge variant="secondary" className="mt-0.5">
          Q{index + 1}
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
              ? "border-border bg-muted/40"
              : ok
                ? "border-success/40 bg-success/10"
                : "border-destructive/40 bg-destructive/10",
          )}
        >
          <AlertDescription>
            {question.type === "short" ? (
              <div className="rich text-sm">
                <b className="text-success">Réponse modèle : </b>
                {question.a}
                <RichText
                  as="div"
                  html={question.e}
                  className="mt-1 text-muted-foreground"
                />
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

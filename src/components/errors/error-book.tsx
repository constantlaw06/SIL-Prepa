"use client";

import {
  ArrowPathIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BANK } from "@/data/bank";
import { useResults } from "@/hooks/use-results";
import { TYPE_LABEL } from "@/lib/quiz";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Réponse attendue, formulée en clair selon le type de question. */
function expectedAnswer(question: Question): string {
  switch (question.type) {
    case "qcm":
      return question.o[question.a].replace(/<[^>]+>/g, "");
    case "multi":
      return question.a.map((i) => question.o[i].replace(/<[^>]+>/g, "")).join(" · ");
    case "vf":
      return question.a ? "Vrai" : "Faux";
    default:
      return question.a;
  }
}

function ErrorItem({
  question,
  index,
  themeKey,
}: {
  question: Question;
  index: number;
  themeKey: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-md border border-border bg-secondary/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 p-3 text-left"
      >
        <span className="mt-0.5 shrink-0 font-mono text-xs text-destructive">
          Q{index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <RichText
            as="span"
            html={question.q}
            className={cn("block text-sm", !open && "line-clamp-2")}
          />
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            {TYPE_LABEL[question.type]}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border px-3 py-3">
          <p className="flex items-start gap-2 text-sm">
            <CheckCircleIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-success"
            />
            <span>
              <span className="font-semibold text-success">Réponse attendue : </span>
              {expectedAnswer(question)}
            </span>
          </p>
          <RichText
            html={question.e}
            className="mt-2 text-sm text-muted-foreground"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/quiz/${themeKey}`}>
                <ArrowPathIcon aria-hidden="true" />
                Refaire ce thème
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/fiches">
                <BookOpenIcon aria-hidden="true" />
                Fiche associée
              </Link>
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Carnet d'erreurs : regroupe par thème les questions ratées lors de la
 * dernière série de chaque thème. Aucune donnée inventée : si rien n'a été
 * corrigé, l'écran le dit et propose de commencer.
 */
export function ErrorBook() {
  const { results } = useResults();

  const groups = Object.entries(BANK)
    .map(([key, theme]) => {
      const last = results.last[key];
      const wrong = (last?.wrong ?? []).filter((i) => i < theme.qs.length);
      return { key, title: theme.title, questions: theme.qs, wrong };
    })
    .filter((g) => g.wrong.length > 0)
    .sort((a, b) => b.wrong.length - a.wrong.length);

  const total = groups.reduce((n, g) => n + g.wrong.length, 0);
  const hasHistory = results.history.length > 0;

  if (total === 0) {
    return hasHistory ? (
      <EmptyState
        icon={CheckCircleIcon}
        title="Aucune erreur à revoir"
        description="Sur tes dernières séries corrigées, tu n'as raté aucune question notée. Enchaîne sur un thème que tu n'as pas encore travaillé."
        action={{ href: "/quiz", label: "Choisir un thème" }}
      />
    ) : (
      <EmptyState
        icon={BookOpenIcon}
        title="Ton carnet d'erreurs est encore vide"
        description="Il se remplit tout seul : chaque question ratée lors d'une correction vient s'y ajouter, avec son explication."
        action={{ href: "/quiz", label: "Commencer un quiz" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {total} erreur{total > 1 ? "s" : ""} à revoir
        </span>{" "}
        sur la dernière série corrigée de chaque thème. Une question disparaît
        d&apos;ici dès que tu la réussis en refaisant le thème.
      </p>

      {groups.map((group) => (
        <section
          key={group.key}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{group.title}</h2>
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
              {group.wrong.length} erreur{group.wrong.length > 1 ? "s" : ""}
            </span>
          </div>
          <ul className="space-y-2">
            {group.wrong.map((index) => (
              <ErrorItem
                key={index}
                question={group.questions[index]}
                index={index}
                themeKey={group.key}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

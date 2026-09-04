"use client";

import {
  AdjustmentsHorizontalIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { SelfAssessment } from "@/components/ui/self-assessment";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { EXOS } from "@/data/exos";
import { useExerciseResults } from "@/hooks/use-exercise-results";
import { LEVEL_CLASSES, LEVELS, exoMeta } from "@/lib/exo-meta";
import type { Level } from "@/lib/exo-meta";
import { recordExercise } from "@/lib/exercise-store";
import type { ResourceState } from "@/lib/mastery";
import type { Exo } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Première phrase de l'énoncé, pour donner un aperçu sans tout déverser. */
function preview(html: string) {
  const text = html
    .replace(/<ol[\s\S]*$/i, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 150 ? `${text.slice(0, 150)}…` : text;
}

/** Un exercice jamais tenté est « new », jamais « à reprendre » par défaut. */
function stateOf(correct: boolean | undefined): ResourceState {
  if (correct === undefined) return "new";
  return correct ? "mastered" : "review";
}

function ExoCard({
  exo,
  index,
  open,
  onToggle,
  correct,
  onSelfAssess,
}: {
  exo: Exo;
  index: number;
  open: boolean;
  onToggle: () => void;
  correct: boolean | undefined;
  onSelfAssess: (value: boolean) => void;
}) {
  const { duration, level } = exoMeta(exo);
  const [showCorrige, setShowCorrige] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {exo.cat}
        </span>
        {level && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-medium",
              LEVEL_CLASSES[level],
            )}
          >
            {level}
          </span>
        )}
        {duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon aria-hidden="true" className="size-3.5" />
            {duration}
          </span>
        )}
        <StatusBadge state={stateOf(correct)} className="ml-auto shrink-0" />
      </div>

      <h3 className="mt-2 font-semibold">{exo.titre}</h3>

      {!open && (
        <p className="mt-1.5 text-sm text-muted-foreground">{preview(exo.enonce)}</p>
      )}

      <Button
        size="sm"
        variant={open ? "outline" : "default"}
        onClick={onToggle}
        aria-expanded={open}
        className="mt-3"
      >
        {open ? (
          <>
            <EyeSlashIcon aria-hidden="true" />
            Replier
          </>
        ) : (
          <>
            <DocumentTextIcon aria-hidden="true" />
            Ouvrir l&apos;énoncé
          </>
        )}
      </Button>

      {open && (
        <div className="mt-4 border-t border-border pt-3">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Énoncé
          </h4>
          <RichText html={exo.enonce} className="mt-1.5 text-sm" />

          <div className="mt-4">
            <label
              htmlFor={`exo-${index}`}
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Ta réponse
            </label>
            <Textarea
              id={`exo-${index}`}
              placeholder="Rédige ta réponse ici avant de consulter le corrigé..."
              className="mt-1.5 min-h-24 resize-y bg-secondary/40"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>

          {!showCorrige ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCorrige(true)}
              className="mt-3"
            >
              <EyeIcon aria-hidden="true" />
              Voir le corrigé et me noter
            </Button>
          ) : (
            <div className="mt-4 rounded-md border border-border bg-secondary/30 p-3">
              <h4 className="text-xs font-semibold tracking-wide text-success uppercase">
                Corrigé
              </h4>
              <RichText html={exo.corrige} className="mt-2 text-sm" />
              <SelfAssessment
                value={correct ?? null}
                onChange={onSelfAssess}
                className="mt-4 border-t border-border pt-3"
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function ExoList() {
  const { results, ready } = useExerciseResults();

  const categories = useMemo(
    () => Array.from(new Set(EXOS.map((e) => e.cat))).sort(),
    [],
  );

  const [cat, setCat] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const list = EXOS.map((exo, i) => ({ exo, i, meta: exoMeta(exo) })).filter(
    ({ exo, meta }) =>
      (cat === null || exo.cat === cat) && (level === null || meta.level === level),
  );

  const activeCount = (cat ? 1 : 0) + (level ? 1 : 0);

  const attempted = Object.values(results.byIndex);
  const correctCount = attempted.filter((r) => r.correct).length;
  const pct = attempted.length ? Math.round((correctCount / attempted.length) * 100) : null;

  const reset = () => {
    setCat(null);
    setLevel(null);
    setOpen(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {EXOS.length} sujets type-examen à rédiger. Traite l&apos;énoncé sur
        brouillon avant d&apos;ouvrir le corrigé : c&apos;est la rédaction qui est
        notée le jour J.
      </p>

      {/* Note globale : uniquement une fois qu'au moins un exercice est tenté. */}
      {ready && attempted.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-medium">Ta note sur les exercices tentés</span>
            <span className="text-2xl font-bold tabular-nums">{pct} %</span>
          </div>
          <Progress value={pct ?? 0} className="mt-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {correctCount}/{attempted.length} correct{correctCount > 1 ? "s" : ""} sur{" "}
            {attempted.length} tenté{attempted.length > 1 ? "s" : ""} · {EXOS.length - attempted.length}{" "}
            restant{EXOS.length - attempted.length !== 1 ? "s" : ""} sur {EXOS.length}. Cette
            note vient de ton auto-évaluation contre le corrigé, pas d&apos;une correction
            automatique.
          </p>
        </div>
      )}

      {/* Filtres : repliés par défaut sur mobile, toujours visibles au-delà */}
      <div className="rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center gap-2 p-3 text-sm font-medium sm:hidden"
        >
          <AdjustmentsHorizontalIcon aria-hidden="true" className="size-4" />
          Filtres
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>

        <div className={cn("space-y-3 p-3 sm:block", !filtersOpen && "hidden sm:block")}>
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
              Thème
            </legend>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={cat === null} onClick={() => setCat(null)}>
                Tous
              </FilterChip>
              {categories.map((c) => (
                <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
                  {c}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
              Difficulté
            </legend>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={level === null} onClick={() => setLevel(null)}>
                Toutes
              </FilterChip>
              {LEVELS.map((l) => (
                <FilterChip key={l} active={level === l} onClick={() => setLevel(l)}>
                  {l}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <XMarkIcon aria-hidden="true" className="size-3.5" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {list.length} exercice{list.length > 1 ? "s" : ""} affiché
        {list.length > 1 ? "s" : ""} sur {EXOS.length}
      </p>

      {list.length === 0 ? (
        <EmptyState
          icon={DocumentTextIcon}
          title="Aucun exercice pour ces filtres"
          description="Aucun sujet ne combine ce thème et cette difficulté. Élargis la sélection pour voir davantage de contenu."
        />
      ) : (
        <div className="space-y-3">
          {list.map(({ exo, i }) => (
            <ExoCard
              key={i}
              exo={exo}
              index={i}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
              correct={results.byIndex[i]?.correct}
              onSelfAssess={(value) => recordExercise(i, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

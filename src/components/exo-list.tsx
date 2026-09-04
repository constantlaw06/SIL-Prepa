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
import { EXOS } from "@/data/exos";
import { LEVEL_CLASSES, LEVELS, exoMeta } from "@/lib/exo-meta";
import type { Level } from "@/lib/exo-meta";
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

function ExoCard({
  exo,
  open,
  onToggle,
}: {
  exo: Exo;
  open: boolean;
  onToggle: () => void;
}) {
  const { duration, level } = exoMeta(exo);

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

          <details className="group mt-4 rounded-md border border-border bg-secondary/30 p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-success">
              <EyeIcon aria-hidden="true" className="size-4" />
              Afficher le corrigé
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                rédige d&apos;abord ta réponse
              </span>
            </summary>
            <RichText html={exo.corrige} className="mt-3 text-sm" />
          </details>
        </div>
      )}
    </article>
  );
}

export function ExoList() {
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
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
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

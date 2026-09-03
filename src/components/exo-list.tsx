"use client";

import {
  ChevronDownIcon,
  ClockIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { RichText } from "@/components/rich-text";
import { SectionTitle } from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EXOS } from "@/data/exos";
import type { Exo } from "@/lib/types";
import { cn } from "@/lib/utils";

function ExoItem({
  exo,
  open,
  onToggle,
}: {
  exo: Exo;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/40"
      >
        <Badge variant="secondary" className="shrink-0">
          {exo.cat}
        </Badge>
        <span className="flex-1 font-medium">{exo.titre}</span>
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
          <ClockIcon aria-hidden="true" className="size-3.5" />
          {exo.diff}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <RichText html={exo.enonce} className="px-4 pb-3 text-sm" />

      {open && (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-1 text-xs font-semibold tracking-wide text-success uppercase">
            Corrigé
          </div>
          <RichText html={exo.corrige} className="text-sm" />
        </div>
      )}
    </Card>
  );
}

export function ExoList() {
  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(EXOS.map((e) => e.cat)))],
    [],
  );
  const [filter, setFilter] = useState("Tous");
  const [open, setOpen] = useState<number | null>(null);

  const list = EXOS.map((exo, i) => ({ exo, i })).filter(
    ({ exo }) => filter === "Tous" || exo.cat === filter,
  );

  return (
    <section>
      <SectionTitle icon={PuzzlePieceIcon}>
        Exercices type-examen (à rédiger)
      </SectionTitle>
      <p className="mb-4 text-sm text-muted-foreground">
        {EXOS.length} sujets ouverts couvrant chaque aspect du programme. Rédige
        ta réponse sur brouillon avant d&apos;ouvrir le corrigé.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setFilter(c);
              setOpen(null);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              filter === c
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map(({ exo, i }) => (
          <ExoItem
            key={i}
            exo={exo}
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}

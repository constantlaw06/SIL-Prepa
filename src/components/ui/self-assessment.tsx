"use client";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";

/**
 * Un texte libre (question ouverte ou exercice rédigé) ne peut pas être
 * corrigé automatiquement de façon fiable : l'étudiant se juge lui-même
 * contre la réponse modèle. Tant qu'il ne l'a pas fait, aucune couleur de
 * succès ne doit apparaître ailleurs dans l'UI - sinon l'interface laisse
 * croire à une bonne réponse par défaut.
 */
export function SelfAssessment({
  value,
  onChange,
  label = "As-tu répondu correctement ?",
  className,
}: {
  value: boolean | null;
  onChange: (correct: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={value === true}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          value === true
            ? "border-success bg-success/10 text-success"
            : "border-border text-muted-foreground hover:border-success/50 hover:text-success",
        )}
      >
        <CheckCircleIcon aria-hidden="true" className="size-3.5" />
        Oui, c&apos;était juste
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={value === false}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          value === false
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

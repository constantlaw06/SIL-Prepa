import { STATE_CLASSES, STATE_LABELS, STATE_MARKS } from "@/lib/mastery";
import type { ResourceState } from "@/lib/mastery";
import { cn } from "@/lib/utils";

/**
 * Indicateur d'état unique à toute l'application. Il combine toujours un
 * symbole et un libellé texte : l'information ne repose jamais sur la seule
 * couleur, et reste lisible pour un lecteur d'écran.
 */
export function StatusBadge({
  state,
  score,
  className,
}: {
  state: ResourceState;
  /** Score affiché à côté du libellé, quand il existe. */
  score?: number | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATE_CLASSES[state],
        className,
      )}
    >
      <span aria-hidden="true">{STATE_MARKS[state]}</span>
      {STATE_LABELS[state]}
      {typeof score === "number" && (
        <span className="tabular-nums opacity-80">· {score} %</span>
      )}
    </span>
  );
}

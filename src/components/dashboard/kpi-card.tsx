import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

import type { IconComponent } from "@/components/section-title";
import { cn } from "@/lib/utils";

export type KpiTone = "default" | "success" | "warning" | "destructive";

const TONES: Record<KpiTone, { icon: string; ring: string }> = {
  default: { icon: "bg-primary/12 text-primary", ring: "border-border" },
  success: { icon: "bg-success/12 text-success", ring: "border-border" },
  warning: { icon: "bg-warning/12 text-warning", ring: "border-warning/40" },
  destructive: {
    icon: "bg-destructive/12 text-destructive",
    ring: "border-destructive/40",
  },
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  tone = "default",
}: {
  icon: IconComponent;
  label: string;
  value: string;
  sub?: string;
  /** Variation par rapport à la série précédente, en points. */
  trend?: number | null;
  tone?: KpiTone;
}) {
  const styles = TONES[tone];
  const up = (trend ?? 0) >= 0;

  return (
    <div className={cn("rounded-lg border bg-card p-4", styles.ring)}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            styles.icon,
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-xs text-muted-foreground">{label}</div>
          <div className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </div>
        </div>
      </div>

      {(sub || typeof trend === "number") && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {typeof trend === "number" && (
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                up ? "text-success" : "text-destructive",
              )}
            >
              {up ? (
                <ArrowTrendingUpIcon aria-hidden="true" className="size-3.5" />
              ) : (
                <ArrowTrendingDownIcon aria-hidden="true" className="size-3.5" />
              )}
              {up ? "+" : ""}
              {trend} pts
            </span>
          )}
          {sub && <span className="truncate text-muted-foreground">{sub}</span>}
        </div>
      )}
    </div>
  );
}

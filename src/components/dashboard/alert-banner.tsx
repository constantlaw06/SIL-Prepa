import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import type { IconComponent } from "@/components/section-title";
import { cn } from "@/lib/utils";

export type AlertTone = "danger" | "warning" | "info";

const TONES: Record<AlertTone, string> = {
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  warning: "border-warning/40 bg-warning/10 text-warning",
  info: "border-primary/40 bg-primary/10 text-primary",
};

export function AlertBanner({
  tone,
  icon: Icon,
  children,
  action,
}: {
  tone: AlertTone;
  icon: IconComponent;
  children: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm",
        TONES[tone],
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 text-foreground">{children}</span>
      {action && (
        <Link
          href={action.href}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold hover:underline"
        >
          {action.label}
          <ChevronRightIcon aria-hidden="true" className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

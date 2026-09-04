import Link from "next/link";

import type { IconComponent } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * État vide utile : il dit ce qui manque, pourquoi, et propose l'action qui
 * fait sortir de cet état. Jamais un simple « 0 » ou « aucun résultat ».
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconComponent;
  title: string;
  description: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-8 text-center",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button asChild size="sm" className="mt-4">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

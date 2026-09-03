import type * as React from "react";

import { cn } from "@/lib/utils";

/** Signature des composants Heroicons (`@heroicons/react/24/outline`). */
export type IconComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

export function SectionTitle({
  icon: Icon,
  children,
  className,
}: {
  icon: IconComponent;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mb-2 flex items-center gap-2 text-xl font-semibold text-primary",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {children}
    </h2>
  );
}

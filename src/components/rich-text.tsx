import { cn } from "@/lib/utils";

/**
 * Rend le contenu pédagogique, rédigé en HTML dans `src/data`.
 * Ce HTML est écrit à la main dans le dépôt (aucune saisie utilisateur),
 * l'injection directe est donc sans risque.
 */
export function RichText({
  html,
  className,
  as: Tag = "div",
}: {
  html: string;
  className?: string;
  as?: "div" | "span";
}) {
  return (
    <Tag
      className={cn("rich", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

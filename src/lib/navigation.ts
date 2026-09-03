import {
  BoltIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  LinkIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import type { IconComponent } from "@/components/section-title";
import { BANK } from "@/data/bank";

export type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
  /** Sous-entrées dépliables dans la barre latérale. */
  children?: { href: string; label: string }[];
};

export const THEME_LINKS = Object.entries(BANK).map(([key, theme]) => ({
  href: `/quiz/${key}`,
  label: theme.title,
}));

export const NAV: NavItem[] = [
  { href: "/", label: "Tableau de bord", icon: Squares2X2Icon },
  { href: "/plan", label: "Plan J-24", icon: CalendarDaysIcon },
  {
    href: "/quiz",
    label: "Quiz",
    icon: PencilSquareIcon,
    children: THEME_LINKS,
  },
  { href: "/exercices", label: "Exercices", icon: PuzzlePieceIcon },
  { href: "/fiches", label: "Fiches", icon: BoltIcon },
  { href: "/methode", label: "Méthode", icon: LightBulbIcon },
  { href: "/ressources", label: "Ressources", icon: LinkIcon },
];

/** Un lien est actif s'il correspond à la route exacte ou à sa sous-arborescence. */
export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Titre affiché dans la barre supérieure pour la route courante. */
export function pageTitle(pathname: string) {
  const themeLink = THEME_LINKS.find((t) => t.href === pathname);
  if (themeLink) return themeLink.label;
  const item = [...NAV].reverse().find((n) => isActive(pathname, n.href));
  return item?.label ?? "Prépa SIL";
}

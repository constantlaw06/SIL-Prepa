"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { BANK } from "@/data/bank";
import { FICHES_HTML } from "@/data/content";
import { EXOS } from "@/data/exos";
import { cn } from "@/lib/utils";

type Kind = "Thème" | "Question" | "Exercice" | "Fiche";

type Entry = { href: string; label: string; context: string; kind: Kind };

/** Le HTML des énoncés n'a pas à peser dans la recherche. */
function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Titres des fiches : ce sont les <h3> du contenu pédagogique. */
const FICHE_TITLES = Array.from(FICHES_HTML.matchAll(/<h3>([\s\S]*?)<\/h3>/g)).map(
  (m) => plain(m[1]),
);

const INDEX: Entry[] = [
  ...Object.entries(BANK).map(([key, theme]) => ({
    href: `/quiz/${key}`,
    label: theme.title,
    context: `${theme.qs.length} questions`,
    kind: "Thème" as const,
  })),
  ...FICHE_TITLES.map((title) => ({
    href: "/fiches",
    label: title,
    context: "Fiche express",
    kind: "Fiche" as const,
  })),
  ...EXOS.map((exo) => ({
    href: "/exercices",
    label: exo.titre,
    context: `${exo.cat} · ${exo.diff}`,
    kind: "Exercice" as const,
  })),
  ...Object.entries(BANK).flatMap(([key, theme]) =>
    theme.qs.map((q) => ({
      href: `/quiz/${key}`,
      label: plain(q.q),
      context: theme.title,
      kind: "Question" as const,
    })),
  ),
];

/** Recherche insensible à la casse et aux accents. */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const HAYSTACK = INDEX.map((e) => normalize(`${e.label} ${e.context}`));

/** Ordre d'affichage des groupes : du plus structurant au plus granulaire. */
const KIND_ORDER: Kind[] = ["Thème", "Fiche", "Exercice", "Question"];

const SUGGESTIONS = ["Sous-réseaux", "SQL", "UML", "Binaire", "POO"];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);

  const trimmed = query.trim();

  const groups = useMemo(() => {
    const q = normalize(trimmed);
    if (q.length < 2) return [];

    const found: Entry[] = [];
    for (let i = 0; i < INDEX.length && found.length < 40; i++) {
      if (HAYSTACK[i].includes(q)) found.push(INDEX[i]);
    }

    return KIND_ORDER.map((kind) => ({
      kind,
      items: found.filter((e) => e.kind === kind).slice(0, 4),
    })).filter((g) => g.items.length > 0);
  }, [trimmed]);

  const open = focused && (trimmed.length >= 2 || trimmed.length === 0);

  const close = () => {
    setQuery("");
    setFocused(false);
  };

  return (
    <div className="relative w-full lg:max-w-md">
      <MagnifyingGlassIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="recherche-resultats"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          window.clearTimeout(blurTimer.current);
          setFocused(true);
        }}
        // Le blur est différé pour laisser passer le clic sur un résultat.
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setFocused(false), 150);
        }}
        onKeyDown={(e) => e.key === "Escape" && close()}
        placeholder="Rechercher un thème, une question…"
        aria-label="Rechercher dans les contenus de révision"
        className="h-9 w-full rounded-md border border-border bg-secondary/60 pr-8 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={close}
          aria-label="Effacer la recherche"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <XMarkIcon aria-hidden="true" className="size-4" />
        </button>
      )}

      {open && (
        <div
          id="recherche-resultats"
          className="absolute top-11 right-0 left-0 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-xl"
        >
          {trimmed.length === 0 ? (
            <div className="p-3">
              <p className="mb-2 text-xs text-muted-foreground">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : groups.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Aucun contenu trouvé pour « {trimmed} ». Essaie un mot-clé plus
              court, par exemple « masque » ou « jointure ».
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {groups.map((group) => (
                <section key={group.kind}>
                  <h3 className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {group.kind}
                    {group.items.length > 1 ? "s" : ""}
                  </h3>
                  <ul>
                    {group.items.map((entry, i) => (
                      <li key={`${entry.href}-${i}`}>
                        <Link
                          href={entry.href}
                          onClick={close}
                          className={cn(
                            "block px-3 py-2 hover:bg-accent",
                            "focus-visible:bg-accent focus-visible:outline-none",
                          )}
                        >
                          <span className="line-clamp-1 text-sm">{entry.label}</span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {entry.context}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

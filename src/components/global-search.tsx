"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

import { BANK } from "@/data/bank";
import { EXOS } from "@/data/exos";

type Entry = { href: string; label: string; context: string; kind: string };

/** Le HTML des énoncés n'a pas à peser dans la recherche. */
function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INDEX: Entry[] = [
  ...Object.entries(BANK).map(([key, theme]) => ({
    href: `/quiz/${key}`,
    label: theme.title,
    context: `${theme.qs.length} questions`,
    kind: "Thème",
  })),
  ...Object.entries(BANK).flatMap(([key, theme]) =>
    theme.qs.map((q) => ({
      href: `/quiz/${key}`,
      label: plain(q.q),
      context: theme.title,
      kind: "Question",
    })),
  ),
  ...EXOS.map((exo) => ({
    href: "/exercices",
    label: exo.titre,
    context: `${exo.cat} - ${exo.diff}`,
    kind: "Exercice",
  })),
];

/** Recherche insensible à la casse et aux accents. */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const HAYSTACK = INDEX.map((e) => normalize(`${e.label} ${e.context}`));

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    const found: Entry[] = [];
    for (let i = 0; i < INDEX.length && found.length < 8; i++) {
      if (HAYSTACK[i].includes(q)) found.push(INDEX[i]);
    }
    return found;
  }, [query]);

  const open = focused && query.trim().length >= 2;

  return (
    <div className="relative w-full max-w-md">
      <MagnifyingGlassIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        // Le blur est différé pour laisser passer le clic sur un résultat.
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="Rechercher un thème, une question, un exercice..."
        aria-label="Rechercher"
        className="h-9 w-full rounded-md border border-border bg-secondary/60 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
      />

      {open && (
        <div className="absolute top-11 right-0 left-0 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
          {matches.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Aucun résultat pour « {query.trim()} ».
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {matches.map((entry, i) => (
                <li key={`${entry.href}-${i}`}>
                  <Link
                    href={entry.href}
                    onClick={() => {
                      setQuery("");
                      setFocused(false);
                    }}
                    className="flex items-start gap-2 px-3 py-2 hover:bg-accent"
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                      {entry.kind}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-sm">{entry.label}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {entry.context}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

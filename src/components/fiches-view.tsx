"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { RichText } from "@/components/rich-text";
import { FICHES_HTML } from "@/data/content";
import { cn } from "@/lib/utils";

type Sheet = { title: string; html: string };

function stripTags(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Le contenu d'origine est un seul bloc HTML enchaînant des `<h3>`. On le
 * découpe par titre pour en faire des fiches indépendantes, sans toucher au
 * texte pédagogique lui-même.
 */
function splitSheets(html: string): Sheet[] {
  const parts = html.split(/<h3>/).slice(1);
  return parts.map((part) => {
    const [rawTitle, ...rest] = part.split("</h3>");
    return { title: stripTags(rawTitle), html: rest.join("</h3>") };
  });
}

export function FichesView() {
  const sheets = useMemo(() => splitSheets(FICHES_HTML), []);
  const [active, setActive] = useState<string | null>(null);

  const visible = active ? sheets.filter((s) => s.title === active) : sheets;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Les points à mémoriser, thème par thème. Relis la fiche juste avant de
        lancer le quiz correspondant : c&apos;est le moment où elle sert le plus.
      </p>

      {/* Sommaire : accès direct à une fiche, filtrable */}
      <nav aria-label="Sommaire des fiches" className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={cn(
            "min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            active === null
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          Toutes ({sheets.length})
        </button>
        {sheets.map((sheet) => (
          <button
            key={sheet.title}
            type="button"
            onClick={() => setActive(sheet.title)}
            aria-pressed={active === sheet.title}
            className={cn(
              "min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active === sheet.title
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {sheet.title}
          </button>
        ))}
      </nav>

      <div className="space-y-4">
        {visible.map((sheet) => (
          <article
            key={sheet.title}
            className="rounded-lg border border-border bg-card p-4 sm:p-5"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <BookOpenIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
              />
              {sheet.title}
            </h2>
            <RichText html={sheet.html} className="mt-2 text-sm" />
          </article>
        ))}
      </div>
    </div>
  );
}

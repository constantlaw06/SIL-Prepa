import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { SectionTitle } from "@/components/section-title";

import { BANK } from "@/data/bank";

export const metadata = { title: "Quiz par thème - Prépa SIL" };

export default function QuizIndexPage() {
  return (
    <section>
      <SectionTitle icon={PencilSquareIcon}>
        Choisis un thème à réviser
      </SectionTitle>
      <p className="mb-4 text-sm text-muted-foreground">
        QCM, Vrai/Faux et questions-réponses. Réponds, puis « Corriger » pour ta
        note et les explications. Objectif : ≥ 80 %.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(BANK).map(([key, theme]) => (
          <Link
            key={key}
            href={`/quiz/${key}`}
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <div className="font-semibold">{theme.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {theme.qs.length} questions
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

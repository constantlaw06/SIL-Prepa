"use client";

import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { SectionTitle } from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN } from "@/data/plan";
import { useExamDate } from "@/hooks/use-exam-date";
import { currentPlanDay } from "@/lib/exam-date";
import { cn } from "@/lib/utils";

export function PlanView() {
  const { exam, ready } = useExamDate();
  const today = ready ? currentPlanDay(exam) : null;

  return (
    <section>
      <SectionTitle icon={CalendarDaysIcon}>
        Calendrier de révision jour par jour
      </SectionTitle>
      <p className="mb-4 text-sm text-muted-foreground">
        Le plan tourne sur tous les thèmes et alterne apprentissage, reprise
        espacée et examens blancs. Clique sur « Réviser » pour lancer le quiz du
        thème.
      </p>

      <div className="space-y-2">
        {PLAN.map((item, idx) =>
          item.ph ? (
            <h3
              key={idx}
              className="pt-4 pb-1 text-xs font-semibold tracking-widest text-warning uppercase"
            >
              {item.ph}
            </h3>
          ) : (
            <Card
              key={idx}
              className={cn(
                "flex-row items-center gap-3 p-3",
                item.d === today && "ring-2 ring-primary",
              )}
            >
              <Badge
                variant={item.d === today ? "default" : "secondary"}
                className="min-w-[46px] justify-center"
              >
                J{item.d}
              </Badge>
              <div className="flex-1">
                <div className="text-sm font-medium">{item.t}</div>
                <div className="text-xs text-muted-foreground">{item.s}</div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/quiz/${item.k}`}>Réviser</Link>
              </Button>
            </Card>
          ),
        )}
      </div>
    </section>
  );
}

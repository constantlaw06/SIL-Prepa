import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/quiz-runner";
import { BANK } from "@/data/bank";
import { themeSets } from "@/lib/quiz-sets";

export function generateStaticParams() {
  return Object.entries(BANK).flatMap(([theme, data]) => {
    const sets = themeSets(theme, data);
    return sets.length > 1
      ? sets.map((s) => ({ theme, set: String(s.setNumber) }))
      : [];
  });
}

export async function generateMetadata({ params }: PageProps<"/quiz/[theme]/[set]">) {
  const { theme, set } = await params;
  const data = BANK[theme];
  const found = data
    ? themeSets(theme, data).find((s) => s.setNumber === Number(set))
    : undefined;
  return {
    title: found ? `${found.title} - Prépa SIL` : "Questionnaire introuvable - Prépa SIL",
  };
}

export default async function QuizSetPage({
  params,
}: PageProps<"/quiz/[theme]/[set]">) {
  const { theme, set } = await params;
  const data = BANK[theme];
  if (!data) notFound();

  const sets = themeSets(theme, data);
  // Thème à série unique : cette route n'a pas de sens, on redirige vers /quiz/[theme].
  if (sets.length === 1) notFound();

  const found = sets.find((s) => s.setNumber === Number(set));
  if (!found) notFound();

  return <QuizRunner key={found.id} set={found} />;
}

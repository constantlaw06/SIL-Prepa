import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/quiz-runner";
import { SetPicker } from "@/components/quiz/set-picker";
import { BANK } from "@/data/bank";
import { themeSets } from "@/lib/quiz-sets";

export function generateStaticParams() {
  return Object.keys(BANK).map((theme) => ({ theme }));
}

export async function generateMetadata({ params }: PageProps<"/quiz/[theme]">) {
  const { theme } = await params;
  const data = BANK[theme];
  return {
    title: data ? `${data.title} - Prépa SIL` : "Thème introuvable - Prépa SIL",
  };
}

export default async function QuizThemePage({
  params,
}: PageProps<"/quiz/[theme]">) {
  const { theme } = await params;
  const data = BANK[theme];
  if (!data) notFound();

  const sets = themeSets(theme, data);

  // Un seul questionnaire : on lance directement le quiz, comme avant.
  if (sets.length === 1) {
    return <QuizRunner key={theme} set={sets[0]} />;
  }

  return <SetPicker sets={sets} themeTitle={data.title} />;
}

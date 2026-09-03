import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/quiz-runner";
import { BANK } from "@/data/bank";

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

  return <QuizRunner key={theme} themeKey={theme} theme={data} />;
}

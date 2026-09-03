import type { Answer, Question, QuestionType } from "@/lib/types";

export const TYPE_LABEL: Record<QuestionType, string> = {
  qcm: "QCM · 1 réponse",
  multi: "QCM · plusieurs réponses",
  vf: "Vrai / Faux",
  short: "Question-réponse",
};

function sameSet(a: number[], b: number[]) {
  const x = [...a].sort((m, n) => m - n);
  const y = [...b].sort((m, n) => m - n);
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

/** Une question `short` n'est jamais notée automatiquement. */
export function isCorrect(q: Question, answer: Answer): boolean {
  switch (q.type) {
    case "qcm":
      return answer === q.a;
    case "vf":
      return (answer === "true") === q.a;
    case "multi":
      return Array.isArray(answer) && sameSet(answer, q.a);
    default:
      return false;
  }
}

export function scoreOf(
  questions: Question[],
  answers: Record<number, Answer>,
) {
  const gradable = questions.filter((q) => q.type !== "short").length;
  const score = questions.reduce(
    (n, q, i) => n + (q.type !== "short" && isCorrect(q, answers[i]) ? 1 : 0),
    0,
  );
  return {
    score,
    gradable,
    pct: gradable ? Math.round((score / gradable) * 100) : 0,
  };
}

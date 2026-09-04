import { NextResponse } from "next/server";

import { auth, isAuthConfigured } from "@/auth";
import { EXOS } from "@/data/exos";
import { prisma } from "@/lib/prisma";
import type { ExerciseResult } from "@/lib/exercise-store";

export const dynamic = "force-dynamic";

async function currentUserId() {
  if (!isAuthConfigured()) return null;
  const session = await auth();
  return session?.user?.id ?? null;
}

function toPayload(rows: { index: number; correct: boolean; at: Date }[]) {
  return rows.map((r) => ({
    index: r.index,
    correct: r.correct,
    at: r.at.toISOString(),
  }));
}

/** Une entrée n'est retenue que si elle a la forme attendue et un index réel. */
function sanitize(input: unknown): ExerciseResult[] {
  if (!Array.isArray(input)) return [];
  const out: ExerciseResult[] = [];
  for (const raw of input.slice(0, EXOS.length)) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    const at = typeof r.at === "string" ? new Date(r.at) : null;
    if (
      typeof r.index !== "number" ||
      !Number.isInteger(r.index) ||
      r.index < 0 ||
      r.index >= EXOS.length ||
      typeof r.correct !== "boolean" ||
      !at ||
      Number.isNaN(at.getTime())
    ) {
      continue;
    }
    out.push({ index: r.index, correct: r.correct, at: at.toISOString() });
  }
  return out;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const rows = await prisma.exerciseResult.findMany({ where: { userId } });
  return NextResponse.json({ results: toPayload(rows) });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { results?: unknown } | null;
  const results = sanitize(body?.results);

  if (results.length > 0) {
    await prisma.$transaction(
      results.map((r) =>
        prisma.exerciseResult.upsert({
          where: { userId_index: { userId, index: r.index } },
          create: { userId, index: r.index, correct: r.correct, at: new Date(r.at) },
          update: { correct: r.correct, at: new Date(r.at) },
        }),
      ),
    );
  }

  const rows = await prisma.exerciseResult.findMany({ where: { userId } });
  return NextResponse.json({ results: toPayload(rows) });
}

import { NextResponse } from "next/server";

import { auth, isAuthConfigured } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { QuizResult } from "@/lib/results-store";

export const dynamic = "force-dynamic";

/** Nombre de séries conservées par compte, comme côté navigateur. */
const HISTORY_MAX = 30;

async function currentUserId() {
  if (!isAuthConfigured()) return null;
  const session = await auth();
  return session?.user?.id ?? null;
}

function toPayload(rows: { theme: string; score: number; gradable: number; pct: number; at: Date }[]) {
  return rows.map((r) => ({
    theme: r.theme,
    score: r.score,
    gradable: r.gradable,
    pct: r.pct,
    at: r.at.toISOString(),
  }));
}

/** Une entrée n'est retenue que si elle a la forme attendue. */
function sanitize(input: unknown): QuizResult[] {
  if (!Array.isArray(input)) return [];
  const out: QuizResult[] = [];
  for (const raw of input.slice(0, 200)) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    const at = typeof r.at === "string" ? new Date(r.at) : null;
    if (
      typeof r.theme !== "string" ||
      r.theme.length > 40 ||
      typeof r.score !== "number" ||
      typeof r.gradable !== "number" ||
      typeof r.pct !== "number" ||
      !at ||
      Number.isNaN(at.getTime())
    ) {
      continue;
    }
    out.push({
      theme: r.theme,
      score: Math.max(0, Math.round(r.score)),
      gradable: Math.max(0, Math.round(r.gradable)),
      pct: Math.min(100, Math.max(0, Math.round(r.pct))),
      at: at.toISOString(),
    });
  }
  return out;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const rows = await prisma.quizResult.findMany({
    where: { userId },
    orderBy: { at: "asc" },
    take: HISTORY_MAX,
  });
  return NextResponse.json({ history: toPayload(rows) });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { results?: unknown } | null;
  const results = sanitize(body?.results);

  if (results.length > 0) {
    await prisma.$transaction(
      results.map((r) =>
        prisma.quizResult.upsert({
          where: { userId_theme_at: { userId, theme: r.theme, at: new Date(r.at) } },
          create: { ...r, at: new Date(r.at), userId },
          update: { score: r.score, gradable: r.gradable, pct: r.pct },
        }),
      ),
    );

    // Au-delà de HISTORY_MAX séries, on ne garde que les plus récentes.
    const stale = await prisma.quizResult.findMany({
      where: { userId },
      orderBy: { at: "desc" },
      skip: HISTORY_MAX,
      select: { id: true },
    });
    if (stale.length > 0) {
      await prisma.quizResult.deleteMany({
        where: { id: { in: stale.map((s) => s.id) } },
      });
    }
  }

  const rows = await prisma.quizResult.findMany({
    where: { userId },
    orderBy: { at: "asc" },
    take: HISTORY_MAX,
  });
  return NextResponse.json({ history: toPayload(rows) });
}

import { AppData, AnalyticsSummary, StudyState } from "./types";
import { startOfDay, ymd } from "./utils";

function collectAllStates(data: AppData): Array<[string, StudyState]> {
  return Object.entries(data.studyStatesBySlug);
}

function computeStreak(data: AppData): number {
  const reviewDays = new Set<string>();

  for (const [, state] of collectAllStates(data)) {
    for (const attempt of state.attemptHistory) {
      reviewDays.add(ymd(new Date(attempt.reviewedAt)));
    }
  }

  let streak = 0;
  let cursor = startOfDay(new Date());

  while (reviewDays.has(ymd(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }

  return streak;
}

function computeRetentionProxy(data: AppData): number {
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  let positive = 0;
  let negative = 0;

  for (const [, state] of collectAllStates(data)) {
    for (const attempt of state.attemptHistory) {
      if (new Date(attempt.reviewedAt).getTime() < cutoff) {
        continue;
      }
      if (attempt.rating >= 2) {
        positive += 1;
      } else {
        negative += 1;
      }
    }
  }

  const total = positive + negative;
  return total === 0 ? 0 : positive / total;
}

function dueByDay(data: AppData, days = 14): Array<{ date: string; count: number }> {
  const map = new Map<string, number>();
  const now = startOfDay(new Date());

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    map.set(ymd(day), 0);
  }

  for (const [, state] of collectAllStates(data)) {
    if (!state.nextReviewAt || state.status === "SUSPENDED") {
      continue;
    }

    const key = ymd(new Date(state.nextReviewAt));
    if (!map.has(key)) {
      continue;
    }

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

export function summarizeAnalytics(data: AppData): AnalyticsSummary {
  const states = collectAllStates(data);
  const totalReviews = states.reduce((sum, [, state]) => sum + state.reviewCount, 0);

  const masteredCount = states.reduce(
    (sum, [, state]) => sum + (state.status === "MASTERED" ? 1 : 0),
    0
  );

  const weakestProblems = states
    .map(([slug, state]) => ({
      slug,
      title: data.problemsBySlug[slug]?.title ?? slug,
      lapses: state.lapses,
      ease: state.ease
    }))
    .sort((a, b) => {
      if (b.lapses !== a.lapses) {
        return b.lapses - a.lapses;
      }
      return a.ease - b.ease;
    })
    .slice(0, 10);

  return {
    streakDays: computeStreak(data),
    totalReviews,
    masteredCount,
    retentionProxy: computeRetentionProxy(data),
    weakestProblems,
    dueByDay: dueByDay(data)
  };
}

import { createDefaultStudyState } from "./constants";
import { AppData, Problem, QueueItem, StudyState } from "./types";

function cloneStateOrDefault(state?: StudyState): StudyState {
  return state ? { ...state } : createDefaultStudyState();
}

function isSetEnabled(problem: Problem, setsEnabled: Record<string, boolean>): boolean {
  if (problem.sourceSet.length === 0) {
    return setsEnabled.Custom !== false;
  }

  return problem.sourceSet.some((set) => setsEnabled[set] !== false);
}

function sortByDueDateAsc(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    const aTs = a.studyState.nextReviewAt ? new Date(a.studyState.nextReviewAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bTs = b.studyState.nextReviewAt ? new Date(b.studyState.nextReviewAt).getTime() : Number.MAX_SAFE_INTEGER;
    return aTs - bTs;
  });
}

function sortWeakest(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    if (b.studyState.lapses !== a.studyState.lapses) {
      return b.studyState.lapses - a.studyState.lapses;
    }
    if (a.studyState.ease !== b.studyState.ease) {
      return a.studyState.ease - b.studyState.ease;
    }
    const aTs = a.studyState.nextReviewAt ? new Date(a.studyState.nextReviewAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bTs = b.studyState.nextReviewAt ? new Date(b.studyState.nextReviewAt).getTime() : Number.MAX_SAFE_INTEGER;
    return aTs - bTs;
  });
}

function interleaveByDifficulty(items: QueueItem[]): QueueItem[] {
  const buckets: Record<string, QueueItem[]> = {
    Easy: [],
    Medium: [],
    Hard: [],
    Unknown: []
  };

  for (const item of sortByDueDateAsc(items)) {
    buckets[item.problem.difficulty].push(item);
  }

  const order: Array<keyof typeof buckets> = ["Easy", "Medium", "Hard", "Unknown"];
  const result: QueueItem[] = [];
  let added = true;

  while (added) {
    added = false;
    for (const key of order) {
      const next = buckets[key].shift();
      if (next) {
        result.push(next);
        added = true;
      }
    }
  }

  return result;
}

function orderItems(items: QueueItem[], strategy: AppData["settings"]["reviewOrder"]): QueueItem[] {
  if (strategy === "weakestFirst") {
    return sortWeakest(items);
  }
  if (strategy === "mixByDifficulty") {
    return interleaveByDifficulty(items);
  }
  return sortByDueDateAsc(items);
}

export function buildTodayQueue(data: AppData, now = new Date()): {
  generatedAt: string;
  dueCount: number;
  newCount: number;
  reinforcementCount: number;
  items: QueueItem[];
} {
  const problems = Object.values(data.problemsBySlug).filter((problem) =>
    isSetEnabled(problem, data.settings.setsEnabled)
  );

  const due: QueueItem[] = [];
  const newCandidates: QueueItem[] = [];
  const reinforcementCandidates: QueueItem[] = [];

  for (const problem of problems) {
    const state = cloneStateOrDefault(data.studyStatesBySlug[problem.leetcodeSlug]);
    if (state.status === "SUSPENDED") {
      continue;
    }

    const dueAt = state.nextReviewAt ? new Date(state.nextReviewAt).getTime() : Number.POSITIVE_INFINITY;
    const isDue = state.reviewCount > 0 && dueAt <= now.getTime();

    if (isDue) {
      due.push({
        slug: problem.leetcodeSlug,
        problem,
        studyState: state,
        due: true,
        category: "due"
      });
      continue;
    }

    if (state.reviewCount === 0 || state.status === "NEW") {
      newCandidates.push({
        slug: problem.leetcodeSlug,
        problem,
        studyState: state,
        due: false,
        category: "new"
      });
      continue;
    }

    reinforcementCandidates.push({
      slug: problem.leetcodeSlug,
      problem,
      studyState: state,
      due: false,
      category: "reinforcement"
    });
  }

  const dueOrdered = orderItems(due, data.settings.reviewOrder);
  const newOrdered = orderItems(newCandidates, data.settings.reviewOrder).slice(
    0,
    data.settings.dailyNewLimit
  );

  const reinforcementSlots = Math.max(0, data.settings.dailyReviewLimit - dueOrdered.length);
  const reinforcementOrdered = orderItems(reinforcementCandidates, data.settings.reviewOrder).slice(
    0,
    reinforcementSlots
  );

  return {
    generatedAt: now.toISOString(),
    dueCount: dueOrdered.length,
    newCount: newOrdered.length,
    reinforcementCount: reinforcementOrdered.length,
    items: [...dueOrdered, ...newOrdered, ...reinforcementOrdered]
  };
}

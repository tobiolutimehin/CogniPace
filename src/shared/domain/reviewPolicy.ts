import { getStudyStateSummary } from "../studyState";
import { Difficulty, Rating, ReviewMode, StudyState } from "../types";
import { difficultyGoalMs } from "../utils";

export function defaultReviewMode(
  state: StudyState | null | undefined
): ReviewMode {
  return getStudyStateSummary(state ?? null).reviewCount > 0
    ? "RECALL"
    : "FULL_SOLVE";
}

export function deriveQuickRating(
  elapsedMs: number | undefined,
  goalMs: number
): Rating {
  if (!elapsedMs || elapsedMs <= 0) {
    return 2;
  }

  if (elapsedMs <= goalMs) {
    return 2;
  }

  if (elapsedMs <= goalMs * 1.5) {
    return 1;
  }

  return 0;
}

export function goalForDifficulty(difficulty: Difficulty): number {
  return difficultyGoalMs(difficulty);
}

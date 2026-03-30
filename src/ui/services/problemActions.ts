import { sendMessage } from "../../shared/runtime";
import { Difficulty, Rating, ReviewMode } from "../../shared/types";

export async function upsertProblemFromPage(input: {
  slug: string;
  title?: string;
  difficulty?: Difficulty;
  url?: string;
}) {
  return sendMessage("UPSERT_PROBLEM_FROM_PAGE", input);
}

export async function getProblemContext(slug: string) {
  return sendMessage("GET_PROBLEM_CONTEXT", { slug });
}

export async function saveReviewResult(input: {
  slug: string;
  rating: Rating;
  solveTimeMs?: number;
  mode?: ReviewMode;
  notes?: string;
  courseId?: string;
  chapterId?: string;
  source?: "overlay" | "dashboard";
}) {
  return sendMessage("SAVE_REVIEW_RESULT", input);
}

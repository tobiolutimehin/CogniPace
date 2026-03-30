import { getStudyPhaseLabel } from "../../shared/studyState";
import {
  CourseQuestionStatusView,
  Difficulty,
  RecommendedReason,
  StudyPhase,
} from "../../shared/types";

export type Tone = "default" | "accent" | "info" | "success" | "danger";

export function formatDisplayDate(
  iso?: string,
  fallback = "Not scheduled"
): string {
  if (!iso) {
    return fallback;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString();
}

export function difficultyTone(difficulty: Difficulty): Tone {
  if (difficulty === "Easy") {
    return "info";
  }
  if (difficulty === "Hard") {
    return "danger";
  }
  return "accent";
}

export function recommendedTone(reason: RecommendedReason): Tone {
  if (reason === "Overdue") {
    return "danger";
  }
  if (reason === "Review focus") {
    return "info";
  }
  return "accent";
}

export function questionStatusTone(status: CourseQuestionStatusView): Tone {
  if (status === "DUE_NOW" || status === "CURRENT" || status === "READY") {
    return "accent";
  }
  if (status === "LOCKED") {
    return "default";
  }
  return "success";
}

export function labelForStatus(value: string): string {
  return value.replace(/_/g, " ");
}

export function formatStudyPhase(
  phase?: StudyPhase | null,
  fallback = "NEW"
): string {
  if (!phase) {
    return fallback;
  }

  return getStudyPhaseLabel(phase);
}

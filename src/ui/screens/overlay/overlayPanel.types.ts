import {Difficulty, Rating} from "../../../domain/types";

export interface OverlayDraftLogFields {
  interviewPattern: string;
  timeComplexity: string;
  spaceComplexity: string;
  languages: string;
  notes: string;
}

export type OverlayHeaderStatusTone =
  | "neutral"
  | "accent"
  | "warning"
  | "danger";

export interface OverlayHeaderStatusCard {
  emphasized?: boolean;
  label: string;
  primary: string;
  secondary: string;
  tone: OverlayHeaderStatusTone;
}

export type OverlayHeaderStatus =
  | {
  cards: OverlayHeaderStatusCard[];
  kind: "empty";
}
  | {
  cards: OverlayHeaderStatusCard[];
  kind: "history";
};

export interface OverlayPanelProps {
  canEditTimer: boolean;
  canResetTimer: boolean;
  canRestartSession: boolean;
  canSaveOverride: boolean;
  canSubmit: boolean;
  collapsed: boolean;
  difficulty: Difficulty;
  draft: OverlayDraftLogFields;
  feedback: string;
  feedbackIsError: boolean;
  isTimerRunning: boolean;
  onChangeDraft: (
    field: keyof OverlayDraftLogFields,
    value: string
  ) => void;
  onCompactSubmit: () => void;
  onFailReview: () => void;
  onOpenSettings: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onRestartSession: () => void;
  onSaveOverride: () => void;
  onSelectRating: (rating: Rating) => void;
  onStartTimer: () => void;
  onSubmit: () => void;
  onToggleCollapse: () => void;
  headerStatus: OverlayHeaderStatus;
  selectedRating: Rating;
  sessionLabel: string;
  targetDisplay: string;
  timerDisplay: string;
  title: string;
}

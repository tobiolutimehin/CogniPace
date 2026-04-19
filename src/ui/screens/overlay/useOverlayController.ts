/** Overlay controller for page detection, timer state, structured logging, and stale-refresh guards. */
import {useCallback, useEffect, useRef, useState} from "react";

import {
  getProblemContext,
  openExtensionPage,
  overrideLastReviewResult,
  saveReviewResult,
  upsertProblemFromPage,
} from "../../../data/repositories/problemSessionRepository";
import {formatClock} from "../../../domain/common/time";
import {defaultReviewMode, deriveQuickRating, goalForDifficulty,} from "../../../domain/fsrs/reviewPolicy";
import {getStudyStateSummary} from "../../../domain/fsrs/studyState";
import {parseDifficulty} from "../../../domain/problem/difficulty";
import {normalizeSlug, slugToTitle} from "../../../domain/problem/slug";
import {Difficulty, Rating, ReviewMode, StudyState} from "../../../domain/types";

import {
  OverlayDraftLogFields,
  OverlayHeaderStatus,
  OverlayHeaderStatusCard,
  OverlayHeaderStatusTone,
  OverlayPanelProps,
} from "./overlayPanel.types";

const TIMER_TICK_MS = 250;

function getProblemSlugFromUrl(url: string): string | null {
  const match = url.match(/\/problems\/([^/]+)\/?/);
  if (!match?.[1]) {
    return null;
  }

  const normalized = normalizeSlug(match[1]);
  return normalized || null;
}

function detectDifficulty(documentRef: Document): Difficulty {
  const candidates = Array.from(documentRef.querySelectorAll("span,div,p"))
    .map((node) => node.textContent?.trim() ?? "")
    .filter(Boolean);

  for (const text of candidates) {
    if (text === "Easy" || text === "Medium" || text === "Hard") {
      return parseDifficulty(text);
    }
  }

  return "Unknown";
}

function detectTitle(documentRef: Document, slug: string): string {
  const h1 = documentRef.querySelector("h1");
  const title = h1?.textContent?.trim();
  return title || slugToTitle(slug);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function differenceInCalendarDays(left: Date, right: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const leftDay = startOfLocalDay(left).getTime();
  const rightDay = startOfLocalDay(right).getTime();
  return Math.round((leftDay - rightDay) / dayMs);
}

function formatMonthDay(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthDayYear(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
  }).format(date);
}

export function formatSubmissionDateLabel(
  iso?: string,
  relativeTo = new Date()
): string {
  if (!iso) {
    return "-";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const difference = differenceInCalendarDays(date, relativeTo);
  if (difference === 0) {
    return "today";
  }
  if (difference === 1) {
    return "tomorrow";
  }
  if (difference === -1) {
    return "yesterday";
  }
  if (difference >= 2 && difference <= 6) {
    return `this ${formatWeekday(date)}`;
  }
  if (difference <= -2 && difference >= -6) {
    return `last ${formatWeekday(date)}`;
  }
  if (date.getFullYear() === relativeTo.getFullYear()) {
    return formatMonthDay(date);
  }

  return formatMonthDayYear(date);
}

function emptyDraft(): OverlayDraftLogFields {
  return {
    interviewPattern: "",
    timeComplexity: "",
    spaceComplexity: "",
    languages: "",
    notes: "",
  };
}

function cloneDraft(draft: OverlayDraftLogFields): OverlayDraftLogFields {
  return {
    interviewPattern: draft.interviewPattern,
    timeComplexity: draft.timeComplexity,
    spaceComplexity: draft.spaceComplexity,
    languages: draft.languages,
    notes: draft.notes,
  };
}

function draftFromStudyState(state: StudyState | null): OverlayDraftLogFields {
  return {
    interviewPattern: state?.interviewPattern ?? "",
    timeComplexity: state?.timeComplexity ?? "",
    spaceComplexity: state?.spaceComplexity ?? "",
    languages: state?.languages ?? "",
    notes: state?.notes ?? "",
  };
}

function reviewPayloadFromDraft(draft: OverlayDraftLogFields) {
  return {
    interviewPattern: draft.interviewPattern,
    timeComplexity: draft.timeComplexity,
    spaceComplexity: draft.spaceComplexity,
    languages: draft.languages,
    notes: draft.notes,
  };
}

function buildSessionLabel(
  state: StudyState | null,
  sessionMode?: ReviewMode
): string {
  const mode = sessionMode ?? defaultReviewMode(state);
  return mode === "FULL_SOLVE" ? "First solve" : "Recall review";
}

function buildDueTone(
  iso?: string,
  relativeTo = new Date()
): OverlayHeaderStatusTone {
  if (!iso) {
    return "neutral";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "neutral";
  }

  const difference = differenceInCalendarDays(date, relativeTo);
  if (difference <= 0) {
    return "danger";
  }
  if (difference <= 7) {
    return "warning";
  }

  return "accent";
}

function buildHistoryStatusCard(
  label: string,
  iso: string,
  tone: OverlayHeaderStatusTone,
  emphasized = false
): OverlayHeaderStatusCard {
  return {
    emphasized,
    label,
    primary: formatSubmissionDateLabel(iso),
    secondary: "",
    tone,
  };
}

function buildHeaderStatus(state: StudyState | null): OverlayHeaderStatus {
  const summary = getStudyStateSummary(state);
  const cards: OverlayHeaderStatusCard[] = [];

  if (summary.lastReviewedAt) {
    cards.push(
      buildHistoryStatusCard(
        "Last submitted",
        summary.lastReviewedAt,
        "neutral"
      )
    );
  }

  if (summary.nextReviewAt) {
    cards.push(
      buildHistoryStatusCard(
        "Next due",
        summary.nextReviewAt,
        buildDueTone(summary.nextReviewAt),
        true
      )
    );
  }

  if (cards.length > 0) {
    return {
      cards,
      kind: "history",
    };
  }

  return {
    cards: [
      {
        label: "No submissions yet",
        primary: "After first submission",
        secondary: "",
        tone: "neutral",
      },
    ],
    kind: "empty",
  };
}

function draftsEqual(
  left: OverlayDraftLogFields,
  right: OverlayDraftLogFields
): boolean {
  return (
    left.interviewPattern === right.interviewPattern &&
    left.timeComplexity === right.timeComplexity &&
    left.spaceComplexity === right.spaceComplexity &&
    left.languages === right.languages &&
    left.notes === right.notes
  );
}

interface SubmittedSessionSnapshot {
  draft: OverlayDraftLogFields;
  mode: ReviewMode;
  rating: Rating;
  solveTimeMs?: number;
}

interface OverlayState {
  activeSlug: string;
  collapsed: boolean;
  currentDifficulty: Difficulty;
  currentState: StudyState | null;
  currentTitle: string;
  draft: OverlayDraftLogFields;
  draftContextSlug: string;
  feedbackIsError: boolean;
  feedbackMessage: string;
  selectedRating: Rating;
  submittedSession: SubmittedSessionSnapshot | null;
}

const initialOverlayState: OverlayState = {
  activeSlug: "",
  collapsed: true,
  currentDifficulty: "Unknown",
  currentState: null,
  currentTitle: "",
  draft: emptyDraft(),
  draftContextSlug: "",
  feedbackIsError: false,
  feedbackMessage: "",
  selectedRating: 2,
  submittedSession: null,
};

export interface OverlayControllerEnvironment {
  documentRef: Document;
  windowRef: Window;
}

/** Coordinates all overlay state while keeping the panel presentational. */
export function useOverlayController(
  environment: OverlayControllerEnvironment
): { panelProps: OverlayPanelProps | null } {
  const {documentRef, windowRef} = environment;
  const [state, setState] = useState<OverlayState>(initialOverlayState);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const activeSlugRef = useRef("");
  const lastHrefRef = useRef(windowRef.location.href);
  const pausedElapsedMsRef = useRef(0);
  const requestTokenRef = useRef(0);
  const tickHandleRef = useRef<number | null>(null);
  const timerStartedAtMsRef = useRef<number | null>(null);
  const warmRefreshHandlesRef = useRef<number[]>([]);

  const clearTick = useCallback(() => {
    if (tickHandleRef.current !== null) {
      windowRef.clearInterval(tickHandleRef.current);
      tickHandleRef.current = null;
    }
  }, [windowRef]);

  const getElapsedMs = useCallback((nowMs = Date.now()): number => {
    return (
      pausedElapsedMsRef.current +
      (timerStartedAtMsRef.current ? nowMs - timerStartedAtMsRef.current : 0)
    );
  }, []);

  const isTimerRunning = useCallback((): boolean => {
    return timerStartedAtMsRef.current !== null;
  }, []);

  const clearWarmRefreshes = useCallback(() => {
    for (const handle of warmRefreshHandlesRef.current) {
      windowRef.clearTimeout(handle);
    }
    warmRefreshHandlesRef.current = [];
  }, [windowRef]);

  const setFeedback = useCallback((message: string, isError = false) => {
    setState((current) => ({
      ...current,
      feedbackIsError: isError,
      feedbackMessage: message,
    }));
  }, []);

  const resetTimer = useCallback(
    () => {
      timerStartedAtMsRef.current = null;
      pausedElapsedMsRef.current = 0;
      clearTick();
      setElapsedMs(0);
      setTimerRunning(false);
    },
    [clearTick]
  );

  const pauseTimer = useCallback(
    () => {
      if (!isTimerRunning() || timerStartedAtMsRef.current === null) {
        return;
      }

      const nextElapsed = getElapsedMs();
      pausedElapsedMsRef.current = nextElapsed;
      timerStartedAtMsRef.current = null;
      clearTick();
      setElapsedMs(nextElapsed);
      setTimerRunning(false);
    },
    [clearTick, getElapsedMs, isTimerRunning]
  );

  const beginTimer = useCallback(
    () => {
      if (isTimerRunning()) {
        return;
      }
      timerStartedAtMsRef.current = Date.now();
      tickHandleRef.current = windowRef.setInterval(() => {
        setElapsedMs(getElapsedMs());
      }, TIMER_TICK_MS);
      setElapsedMs(getElapsedMs());
      setTimerRunning(true);
    },
    [getElapsedMs, isTimerRunning, windowRef]
  );

  const startTimer = useCallback(
    () => {
      if (state.submittedSession) {
        return;
      }

      beginTimer();
    },
    [beginTimer, state.submittedSession]
  );

  const refreshCurrentPage = useCallback(
    async (slugOverride?: string): Promise<void> => {
      const slug =
        slugOverride ?? getProblemSlugFromUrl(windowRef.location.href);
      if (!slug) {
        return;
      }

      const requestToken = ++requestTokenRef.current;
      const title = detectTitle(documentRef, slug);
      const detectedDifficulty = detectDifficulty(documentRef);

      const upsert = await upsertProblemFromPage({
        slug,
        title,
        difficulty: detectedDifficulty,
        url: `https://leetcode.com/problems/${slug}/`,
      });

      if (
        requestToken !== requestTokenRef.current ||
        activeSlugRef.current !== slug
      ) {
        return;
      }

      if (!upsert.ok) {
        setFeedback(upsert.error ?? "Failed to sync problem.", true);
        return;
      }

      const context = await getProblemContext(slug);
      if (
        requestToken !== requestTokenRef.current ||
        activeSlugRef.current !== slug
      ) {
        return;
      }

      if (!context.ok) {
        setFeedback(context.error ?? "Failed to fetch context.", true);
        return;
      }

      const problemContext = context.data ?? {
        problem: null,
        studyState: null,
      };
      const currentDifficulty =
        problemContext.problem?.difficulty ?? detectedDifficulty;
      const currentState = problemContext.studyState ?? null;
      const currentTitle = problemContext.problem?.title ?? title;
      const nextDraft = draftFromStudyState(currentState);

      setState((current) => ({
        ...current,
        currentDifficulty,
        currentState,
        currentTitle,
        draftContextSlug:
          current.draftContextSlug !== slug ? slug : current.draftContextSlug,
        draft:
          current.draftContextSlug !== slug
            ? nextDraft
            : current.draft,
        feedbackIsError: false,
        feedbackMessage: "",
        selectedRating:
          current.draftContextSlug !== slug
            ? (currentState?.lastRating ?? 2)
            : current.selectedRating,
      }));
    },
    [documentRef, setFeedback, windowRef]
  );

  const persistReview = useCallback(
    async (
      slug: string,
      rating: Rating,
      mode: ReviewMode,
      solveTimeMs: number | undefined,
      draft: OverlayDraftLogFields
    ): Promise<boolean> => {
      const response = await saveReviewResult({
        slug,
        rating,
        mode,
        solveTimeMs,
        ...reviewPayloadFromDraft(draft),
        source: "overlay",
      });

      if (!response.ok) {
        setFeedback(response.error ?? "Failed to save review.", true);
        return false;
      }

      return true;
    },
    [setFeedback]
  );

  const persistOverride = useCallback(
    async (
      slug: string,
      rating: Rating,
      mode: ReviewMode,
      solveTimeMs: number | undefined,
      draft: OverlayDraftLogFields
    ): Promise<boolean> => {
      const response = await overrideLastReviewResult({
        slug,
        rating,
        mode,
        solveTimeMs,
        ...reviewPayloadFromDraft(draft),
        source: "overlay",
      });

      if (!response.ok) {
        setFeedback(response.error ?? "Failed to save override.", true);
        return false;
      }

      return true;
    },
    [setFeedback]
  );

  const commitSubmission = useCallback(
    async (rating: Rating): Promise<void> => {
      if (!state.activeSlug || state.submittedSession) {
        return;
      }

      if (isTimerRunning()) {
        pauseTimer();
      }

      const solveTimeMs = getElapsedMs() > 0 ? getElapsedMs() : undefined;
      const mode = defaultReviewMode(state.currentState);
      const draftSnapshot = cloneDraft(state.draft);
      const saved = await persistReview(
        state.activeSlug,
        rating,
        mode,
        solveTimeMs,
        draftSnapshot
      );
      if (!saved) {
        return;
      }

      setState((current) => ({
        ...current,
        collapsed: false,
        selectedRating: rating,
        submittedSession: {
          draft: draftSnapshot,
          mode,
          rating,
          solveTimeMs,
        },
      }));

      await refreshCurrentPage(state.activeSlug);
    },
    [
      getElapsedMs,
      isTimerRunning,
      pauseTimer,
      persistReview,
      refreshCurrentPage,
      state.activeSlug,
      state.currentState,
      state.draft,
      state.submittedSession,
    ]
  );

  const onSubmit = useCallback(async (): Promise<void> => {
    await commitSubmission(state.selectedRating);
  }, [commitSubmission, state.selectedRating]);

  const onCompactSubmit = useCallback(async (): Promise<void> => {
    if (!state.activeSlug || state.submittedSession) {
      return;
    }

    const rating = deriveQuickRating(
      getElapsedMs() > 0 ? getElapsedMs() : undefined,
      goalForDifficulty(state.currentDifficulty)
    );
    await commitSubmission(rating);
  }, [
    commitSubmission,
    getElapsedMs,
    state.activeSlug,
    state.currentDifficulty,
    state.submittedSession,
  ]);

  const onFailReview = useCallback(async (): Promise<void> => {
    await commitSubmission(0);
  }, [commitSubmission]);

  const onSaveOverride = useCallback(async (): Promise<void> => {
    if (!state.activeSlug || !state.submittedSession) {
      return;
    }

    const draftSnapshot = cloneDraft(state.draft);
    const saved = await persistOverride(
      state.activeSlug,
      state.selectedRating,
      state.submittedSession.mode,
      state.submittedSession.solveTimeMs,
      draftSnapshot
    );
    if (!saved) {
      return;
    }

    setState((current) => ({
      ...current,
      submittedSession: {
        ...current.submittedSession!,
        draft: draftSnapshot,
        rating: state.selectedRating,
      },
    }));
    await refreshCurrentPage(state.activeSlug);
  }, [
    persistOverride,
    refreshCurrentPage,
    state.activeSlug,
    state.draft,
    state.selectedRating,
    state.submittedSession,
  ]);

  const restartSession = useCallback(
    (startTimerAfterRestart: boolean) => {
      resetTimer();
      setState((current) => ({
        ...current,
        draft: draftFromStudyState(current.currentState),
        feedbackIsError: false,
        feedbackMessage: "",
        selectedRating: current.currentState?.lastRating ?? 2,
        submittedSession: null,
      }));

      if (startTimerAfterRestart) {
        windowRef.setTimeout(() => {
          beginTimer();
        }, 0);
      }
    },
    [beginTimer, resetTimer, windowRef]
  );

  const scheduleWarmRefreshes = useCallback(
    (slug: string) => {
      clearWarmRefreshes();
      for (const delayMs of [600, 1800]) {
        const handle = windowRef.setTimeout(() => {
          if (activeSlugRef.current === slug) {
            void refreshCurrentPage(slug);
          }
        }, delayMs);
        warmRefreshHandlesRef.current.push(handle);
      }
    },
    [clearWarmRefreshes, refreshCurrentPage, windowRef]
  );

  const bootstrap = useCallback(async (): Promise<void> => {
    const slug = getProblemSlugFromUrl(windowRef.location.href);
    if (!slug) {
      ++requestTokenRef.current;
      activeSlugRef.current = "";
      clearWarmRefreshes();
      resetTimer();
      setTimerRunning(false);
      setState((current) => ({
        ...current,
        activeSlug: "",
        currentDifficulty: "Unknown",
        currentState: null,
        currentTitle: "",
        draft: emptyDraft(),
        draftContextSlug: "",
        feedbackIsError: false,
        feedbackMessage: "",
        selectedRating: 2,
        submittedSession: null,
      }));
      return;
    }

    if (slug === activeSlugRef.current) {
      return;
    }

    ++requestTokenRef.current;
    activeSlugRef.current = slug;
    clearWarmRefreshes();
    resetTimer();
    setTimerRunning(false);
    setState((current) => ({
      ...current,
      activeSlug: slug,
      currentState: null,
      currentTitle: detectTitle(documentRef, slug),
      currentDifficulty: detectDifficulty(documentRef),
      draft: emptyDraft(),
      draftContextSlug: "",
      feedbackIsError: false,
      feedbackMessage: "",
      selectedRating: 2,
      submittedSession: null,
    }));

    await refreshCurrentPage(slug);
    scheduleWarmRefreshes(slug);
  }, [
    clearWarmRefreshes,
    documentRef,
    refreshCurrentPage,
    resetTimer,
    scheduleWarmRefreshes,
    windowRef.location.href,
  ]);

  useEffect(() => {
    const handle = windowRef.setTimeout(() => {
      void bootstrap();
    }, 0);

    return () => {
      windowRef.clearTimeout(handle);
    };
  }, [bootstrap, windowRef]);

  useEffect(() => {
    const handle = windowRef.setInterval(() => {
      if (windowRef.location.href !== lastHrefRef.current) {
        lastHrefRef.current = windowRef.location.href;
        void bootstrap();
      }
    }, 1000);

    return () => {
      windowRef.clearInterval(handle);
    };
  }, [bootstrap, windowRef]);

  useEffect(() => {
    return () => {
      clearWarmRefreshes();
      clearTick();
    };
  }, [clearTick, clearWarmRefreshes]);

  if (!state.activeSlug) {
    return {panelProps: null};
  }

  const sessionMode =
    state.submittedSession?.mode ?? defaultReviewMode(state.currentState);
  const canSubmit = state.submittedSession === null;
  const canSaveOverride =
    state.submittedSession !== null &&
    (
      state.submittedSession.rating !== state.selectedRating ||
      !draftsEqual(state.submittedSession.draft, state.draft)
    );

  return {
    panelProps: {
      canEditTimer: canSubmit,
      canResetTimer: canSubmit && (timerRunning || elapsedMs > 0),
      canRestartSession: state.submittedSession !== null,
      canSaveOverride,
      canSubmit,
      collapsed: state.collapsed,
      difficulty: state.currentDifficulty,
      draft: state.draft,
      feedback: state.feedbackMessage,
      feedbackIsError: state.feedbackIsError,
      isTimerRunning: timerRunning,
      onChangeDraft: (field, value) => {
        setState((current) => ({
          ...current,
          draft: {
            ...current.draft,
            [field]: value,
          },
        }));
      },
      onCompactSubmit: () => {
        void onCompactSubmit();
      },
      onFailReview: () => {
        void onFailReview();
      },
      onOpenSettings: () => {
        void openExtensionPage("dashboard.html?view=settings");
      },
      onPauseTimer: () => {
        if (!canSubmit) {
          return;
        }
        pauseTimer();
      },
      onResetTimer: () => {
        if (!canSubmit) {
          return;
        }
        resetTimer();
      },
      onRestartSession: () => {
        if (!state.submittedSession) {
          return;
        }

        restartSession(false);
      },
      onSaveOverride: () => {
        void onSaveOverride();
      },
      onSelectRating: (rating: Rating) => {
        setState((current) => ({
          ...current,
          selectedRating: rating,
        }));
      },
      onStartTimer: () => {
        if (state.submittedSession) {
          restartSession(true);
          return;
        }
        if (!canSubmit) {
          return;
        }
        startTimer();
      },
      onSubmit: () => {
        void onSubmit();
      },
      onToggleCollapse: () => {
        setState((current) => ({
          ...current,
          collapsed: !current.collapsed,
        }));
      },
      headerStatus: buildHeaderStatus(state.currentState),
      selectedRating: state.selectedRating,
      sessionLabel: buildSessionLabel(state.currentState, sessionMode),
      targetDisplay: formatClock(goalForDifficulty(state.currentDifficulty)),
      timerDisplay: formatClock(elapsedMs),
      title: state.currentTitle,
    },
  };
}

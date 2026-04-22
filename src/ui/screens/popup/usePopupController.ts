/** Popup-local state and actions for the recommendation-first surface. */
import { startTransition, useMemo, useState } from "react";

import {
  openDashboardPage,
  openSettingsPage,
} from "../../../data/repositories/extensionNavigationRepository";
import { openProblemPage } from "../../../data/repositories/problemSessionRepository";
import { updateSettings } from "../../../data/repositories/settingsRepository";
import { StudyMode } from "../../../domain/types";
import { RecommendedProblemView } from "../../../domain/views";
import { createMockAppShellPayload } from "../../mockData";
import { useAppShellQuery } from "../../state/useAppShellQuery";

function currentRecommended(
  candidates: RecommendedProblemView[],
  fallback: RecommendedProblemView | null,
  recommendedIndex: number
): RecommendedProblemView | null {
  if (candidates.length === 0) {
    return fallback;
  }

  return candidates[recommendedIndex % candidates.length] ?? candidates[0];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const STUDY_MODE_REQUEST_DELAY_MS = 500;

/** Coordinates popup data loading, recommendation rotation, and user actions. */
export function usePopupController() {
  const { load, payload, setPayload, setStatus, status } = useAppShellQuery(
    createMockAppShellPayload()
  );
  const [recommendedIndex, setRecommendedIndex] = useState(0);
  const [isUpdatingStudyMode, setIsUpdatingStudyMode] = useState(false);
  const studyMode = payload?.settings.studyMode ?? "studyPlan";

  const recommended = useMemo(
    () =>
      currentRecommended(
        payload?.popup.recommendedCandidates ?? [],
        payload?.popup.recommended ?? null,
        recommendedIndex
      ),
    [
      payload?.popup.recommended,
      payload?.popup.recommendedCandidates,
      recommendedIndex,
    ]
  );

  async function refresh(resetRecommendation = false): Promise<void> {
    if (resetRecommendation) {
      startTransition(() => {
        setRecommendedIndex(0);
      });
    }

    await load();
  }

  async function onOpenProblem(target: {
    slug: string;
    courseId?: string;
    chapterId?: string;
  }): Promise<void> {
    const response = await openProblemPage(target);
    if (!response.ok) {
      setStatus({
        message: response.error ?? "Failed to open problem.",
        isError: true,
      });
    }
  }

  async function setStudyMode(mode: StudyMode): Promise<void> {
    if (studyMode === mode || isUpdatingStudyMode) {
      return;
    }

    setIsUpdatingStudyMode(true);
    setStatus({
      message: "",
      isError: false,
    });

    await delay(STUDY_MODE_REQUEST_DELAY_MS);
    const response = await updateSettings({ studyMode: mode });

    if (!response.ok) {
      setIsUpdatingStudyMode(false);
      setStatus({
        message: response.error ?? "Failed to update study mode.",
        isError: true,
      });
      return;
    }

    setPayload((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        settings: response.data?.settings ?? {
          ...current.settings,
          studyMode: mode,
        },
      };
    });
    setIsUpdatingStudyMode(false);
  }

  return {
    activeCourseDetail: payload?.activeCourse ?? null,
    activeCourse: payload?.popup.activeCourse ?? null,
    courseNext: payload?.popup.courseNext ?? null,
    hasMultipleRecommended:
      (payload?.popup.recommendedCandidates.length ?? 0) > 1,
    isUpdatingStudyMode,
    isCourseMode: studyMode === "studyPlan",
    studyMode,
    onOpenDashboard: openDashboardPage,
    openCoursesDashboard: () => {
      openDashboardPage("courses");
    },
    onOpenProblem,
    onOpenSettings: openSettingsPage,
    payload,
    recommended,
    refresh,
    setStudyMode,
    setRecommendedIndex,
    shuffleRecommendation: () => {
      startTransition(() => {
        setRecommendedIndex((current) => {
          const count = payload?.popup.recommendedCandidates.length ?? 1;
          return (current + 1) % count;
        });
      });
    },
    status,
  };
}

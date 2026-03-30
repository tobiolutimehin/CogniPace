import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";

import { DEFAULT_SETTINGS } from "../../../shared/constants";
import { UserSettings } from "../../../shared/types";
import { createMockAppShellPayload } from "../../mockData";
import { useAppShellQuery } from "../../services/appShell";
import {
  addProblemToCourse,
  setActiveCourseChapter,
  switchActiveCourse,
} from "../../services/courseActions";
import { openProblemPage } from "../../services/navigation";
import {
  downloadBackupJson,
  exportData,
  importData,
  updateSettings,
} from "../../services/settingsActions";
import {
  createDefaultLibraryFilters,
  filterLibraryRows,
  LibraryFilters,
} from "../../view-models/library";

import {
  CourseFormState,
  resolveCourseForm,
} from "./components/CourseIngestForm";
import {
  buildDashboardUrl,
  getDashboardRoute,
  readDashboardViewFromSearch,
  DashboardView,
} from "./routes";

function cloneSettings(settings: UserSettings): UserSettings {
  return {
    ...settings,
    quietHours: { ...settings.quietHours },
    setsEnabled: { ...settings.setsEnabled },
  };
}

function isImportPayloadCandidate(
  value: unknown
): value is Parameters<typeof importData>[0] {
  return Boolean(value) && typeof value === "object";
}

export function useDashboardController() {
  const { load, payload, setStatus, status } = useAppShellQuery(
    createMockAppShellPayload()
  );
  const [view, setView] = useState<DashboardView>(() =>
    readDashboardViewFromSearch(window.location.search)
  );
  const [filters, setFilters] = useState<LibraryFilters>(
    createDefaultLibraryFilters()
  );
  const [settingsDraftState, setSettingsDraftState] =
    useState<UserSettings | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setView(readDashboardViewFromSearch(window.location.search));
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const draftSettings = useMemo(() => {
    const source = settingsDraftState ?? payload?.settings ?? DEFAULT_SETTINGS;
    return cloneSettings(source);
  }, [payload?.settings, settingsDraftState]);

  const rows = useMemo(
    () =>
      filterLibraryRows(payload?.library ?? [], {
        ...filters,
        query: deferredQuery,
      }),
    [deferredQuery, filters, payload?.library]
  );

  async function refresh(clearStatus = true): Promise<void> {
    await load({ clearStatusOnSuccess: clearStatus });
  }

  function navigateToView(nextView: DashboardView): void {
    startTransition(() => {
      setView(nextView);
    });
    window.history.pushState({}, "", buildDashboardUrl(window.location.href, nextView));
  }

  async function runMutation<T extends { ok: boolean; error?: string }>(
    action: Promise<T>,
    successMessage?: string
  ): Promise<boolean> {
    const response = await action;
    if (!response.ok) {
      setStatus({
        message: response.error ?? "Action failed.",
        isError: true,
      });
      return false;
    }

    if (successMessage) {
      setStatus({
        message: successMessage,
        isError: false,
      });
    }
    await load({ clearStatusOnSuccess: false });
    return true;
  }

  async function onOpenProblem(target: {
    slug: string;
    chapterId?: string;
    courseId?: string;
  }): Promise<void> {
    const response = await openProblemPage(target);
    if (!response.ok) {
      setStatus({
        message: response.error ?? "Failed to open problem.",
        isError: true,
      });
    }
  }

  async function onToggleMode(): Promise<void> {
    const nextMode =
      payload?.settings.studyMode === "studyPlan" ? "freestyle" : "studyPlan";
    if (!nextMode) {
      return;
    }

    await runMutation(
      updateSettings({ studyMode: nextMode }),
      "Study mode updated."
    );
  }

  function updateSettingsDraft(updater: (current: UserSettings) => UserSettings) {
    setSettingsDraftState((current) =>
      updater(cloneSettings(current ?? payload?.settings ?? DEFAULT_SETTINGS))
    );
  }

  async function onSaveSettings(): Promise<void> {
    await runMutation(updateSettings(draftSettings), "Settings saved.");
    setSettingsDraftState(null);
  }

  async function onExportData(): Promise<void> {
    const response = await exportData();
    if (!response.ok || !response.data) {
      setStatus({
        message: response.error ?? "Failed to export data.",
        isError: true,
      });
      return;
    }

    downloadBackupJson(response.data);
    setStatus({
      message: "Backup exported.",
      isError: false,
    });
  }

  async function onImportData(): Promise<void> {
    if (!importFile) {
      setStatus({
        message: "Choose a backup file first.",
        isError: true,
      });
      return;
    }

    const text = await importFile.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setStatus({
        message: "Invalid JSON backup file.",
        isError: true,
      });
      return;
    }

    if (!isImportPayloadCandidate(parsed)) {
      setStatus({
        message: "Backup payload is malformed.",
        isError: true,
      });
      return;
    }

    await runMutation(importData(parsed), "Backup imported.");
  }

  async function onSubmitCourseForm(form: CourseFormState): Promise<boolean> {
    const resolvedForm = resolveCourseForm(payload, form);
    if (!resolvedForm.input.trim()) {
      setStatus({
        message: "Provide a LeetCode slug or URL.",
        isError: true,
      });
      return false;
    }

    return runMutation(
      addProblemToCourse({
        courseId: resolvedForm.courseId,
        chapterId: resolvedForm.chapterId,
        input: resolvedForm.input.trim(),
        markAsStarted: resolvedForm.markAsStarted,
      }),
      "Question appended to the course."
    );
  }

  async function onSwitchCourse(courseId: string): Promise<void> {
    await runMutation(switchActiveCourse(courseId), "Active course updated.");
  }

  async function onSetChapter(courseId: string, chapterId: string): Promise<void> {
    await runMutation(
      setActiveCourseChapter(courseId, chapterId),
      "Active chapter updated."
    );
  }

  return {
    draftSettings,
    filters,
    importFile,
    navigateToView,
    onExportData,
    onImportData,
    onOpenProblem,
    onSaveSettings,
    onSetChapter,
    onSubmitCourseForm,
    onSwitchCourse,
    onToggleMode,
    payload,
    refresh,
    route: getDashboardRoute(view),
    rows,
    setFilters,
    setImportFile,
    setSettingsDraftState,
    status,
    updateSettingsDraft,
    view,
  };
}

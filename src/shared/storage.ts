import { BUILT_IN_SETS, DEFAULT_SETTINGS } from "./constants";
import { AppData, UserSettings } from "./types";

const STORAGE_KEY = "leetcode_spaced_repetition_data_v1";

const EMPTY_DATA: AppData = {
  problemsBySlug: {},
  studyStatesBySlug: {},
  settings: DEFAULT_SETTINGS
};

function normalizeSettings(input?: Partial<UserSettings>): UserSettings {
  const merged: UserSettings = {
    ...DEFAULT_SETTINGS,
    ...(input ?? {}),
    quietHours: {
      ...DEFAULT_SETTINGS.quietHours,
      ...(input?.quietHours ?? {})
    },
    setsEnabled: {
      ...DEFAULT_SETTINGS.setsEnabled,
      ...(input?.setsEnabled ?? {})
    }
  };

  if (merged.studyMode !== "freestyle" && merged.studyMode !== "studyPlan") {
    merged.studyMode = DEFAULT_SETTINGS.studyMode;
  }

  if (typeof merged.activeStudyPlanId !== "string" || !merged.activeStudyPlanId.trim()) {
    merged.activeStudyPlanId = DEFAULT_SETTINGS.activeStudyPlanId;
  }

  for (const setName of BUILT_IN_SETS) {
    if (typeof merged.setsEnabled[setName] !== "boolean") {
      merged.setsEnabled[setName] = true;
    }
  }

  if (typeof merged.setsEnabled.Custom !== "boolean") {
    merged.setsEnabled.Custom = true;
  }

  return merged;
}

export async function getAppData(): Promise<AppData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<AppData> | undefined;

  if (!stored) {
    return { ...EMPTY_DATA, settings: normalizeSettings() };
  }

  return {
    problemsBySlug: stored.problemsBySlug ?? {},
    studyStatesBySlug: stored.studyStatesBySlug ?? {},
    settings: normalizeSettings(stored.settings)
  };
}

export async function saveAppData(data: AppData): Promise<void> {
  const payload: AppData = {
    problemsBySlug: data.problemsBySlug,
    studyStatesBySlug: data.studyStatesBySlug,
    settings: normalizeSettings(data.settings)
  };

  await chrome.storage.local.set({ [STORAGE_KEY]: payload });
}

export async function mutateAppData(
  updater: (data: AppData) => AppData | Promise<AppData>
): Promise<AppData> {
  const current = await getAppData();
  const updated = await updater(current);
  await saveAppData(updated);
  return updated;
}

export function mergeSettings(
  current: UserSettings,
  patch: Partial<UserSettings>
): UserSettings {
  return normalizeSettings({
    ...current,
    ...patch,
    quietHours: {
      ...current.quietHours,
      ...(patch.quietHours ?? {})
    },
    setsEnabled: {
      ...current.setsEnabled,
      ...(patch.setsEnabled ?? {})
    }
  });
}

export { STORAGE_KEY };

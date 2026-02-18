import { StudyState, UserSettings } from "./types";

export const STORAGE_KEY = "leetcode_spaced_repetition_data_v1";

export const BUILT_IN_SETS = ["Blind75", "NeetCode150", "Grind75", "LeetCode75"];

export const DEFAULT_SETTINGS: UserSettings = {
  dailyNewLimit: 3,
  dailyReviewLimit: 15,
  reviewOrder: "dueFirst",
  setsEnabled: {
    Blind75: true,
    NeetCode150: true,
    Grind75: true,
    LeetCode75: true,
    Custom: true
  },
  scheduleIntensity: "normal",
  requireSolveTime: false,
  autoDetectSolved: true,
  notifications: false,
  quietHours: {
    startHour: 22,
    endHour: 8
  },
  slowSolveDowngradeEnabled: false,
  slowSolveThresholdMs: 40 * 60 * 1000
};

export function createDefaultStudyState(): StudyState {
  return {
    status: "NEW",
    reviewCount: 0,
    lapses: 0,
    ease: 2.5,
    intervalDays: 0,
    tags: [],
    attemptHistory: []
  };
}

/** Notification helpers and quiet-hour policy for the background worker. */
import {readLocalStorage} from "../../data/datasources/chrome/storage";
import {getAppData, STORAGE_KEY} from "../../data/repositories/appDataRepository";
import {findEarliestDueDate} from "../../domain/fsrs/scheduler";
import {buildTodayQueue} from "../../domain/queue/buildTodayQueue";
import {StudyState} from "../../domain/types";

function inQuietHours(
  startHour: number,
  endHour: number,
  currentHour: number
): boolean {
  if (startHour === endHour) {
    return false;
  }

  if (startHour < endHour) {
    return currentHour >= startHour && currentHour < endHour;
  }

  return currentHour >= startHour || currentHour < endHour;
}

/** Sends a due-queue notification when alerts are enabled and quiet-hours allow it. */
export async function maybeNotifyDueQueue(): Promise<void> {
  const data = await getAppData();
  if (!data.settings.notifications) {
    return;
  }

  const now = new Date();
  const hour = now.getHours();
  if (
    inQuietHours(
      data.settings.quietHours.startHour,
      data.settings.quietHours.endHour,
      hour
    )
  ) {
    return;
  }

  const queue = buildTodayQueue(data, now);
  if (queue.dueCount <= 0) {
    return;
  }

  /**
   * [TODO]: ÍReplace with Cognipace icon when available. Using a 1x1 transparent PNG to avoid showing the default Chrome notification icon, which can be visually jarring and doesn't fit with our branding.
   */
  await chrome.notifications.create("cognipace-due", {
    type: "basic",
    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    title: "CogniPace reviews due",
    message: `You have ${queue.dueCount} review${queue.dueCount === 1 ? "" : "s"} due today.`,
  });
}

/** Cancels any existing due-check alarm and schedules a new one for the next future due date.
 *  Reads raw storage to avoid triggering a writeback that would re-fire storage.onChanged. */
export async function scheduleNextDueAlarm(): Promise<void> {
  const result = await readLocalStorage([STORAGE_KEY]);
  const stored = result[STORAGE_KEY] as { studyStatesBySlug?: Record<string, StudyState> } | undefined;
  const studyStatesBySlug = stored?.studyStatesBySlug ?? {};

  const now = new Date();
  const earliest = findEarliestDueDate(studyStatesBySlug, now);

  await chrome.alarms.clear("due-check");
  if (earliest) {
    chrome.alarms.create("due-check", { when: earliest.getTime() });
  }
}

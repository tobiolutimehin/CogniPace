import { sendMessage } from "../../shared/runtime";
import { ExportPayload, UserSettings } from "../../shared/types";

export async function updateSettings(
  payload: Partial<UserSettings> & { activeStudyPlanId?: string }
) {
  return sendMessage("UPDATE_SETTINGS", payload);
}

export async function exportData() {
  return sendMessage("EXPORT_DATA", {});
}

export async function importData(payload: ExportPayload) {
  return sendMessage("IMPORT_DATA", payload);
}

export function downloadBackupJson(
  payload: ExportPayload,
  documentRef: Document = document
): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement("a");
  link.href = url;
  link.download = "kinetic-terminal-backup.json";
  link.click();
  URL.revokeObjectURL(url);
}

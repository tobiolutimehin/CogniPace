import { sendMessage } from "../../shared/runtime";

export function openDashboardPage(
  view?: string,
  windowRef: Window = window
): void {
  const url = new URL(
    typeof chrome !== "undefined" && chrome.runtime?.id
      ? chrome.runtime.getURL("dashboard.html")
      : `${windowRef.location.origin}/dashboard.html`
  );

  if (view) {
    url.searchParams.set("view", view);
  }

  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url: url.toString() });
    return;
  }

  windowRef.open(url.toString(), "_blank");
}

export function openSettingsPage(windowRef: Window = window): void {
  openDashboardPage("settings", windowRef);
}

export async function openProblemPage(target: {
  slug: string;
  courseId?: string;
  chapterId?: string;
}) {
  return sendMessage("OPEN_PROBLEM_PAGE", target);
}

export async function openExtensionPage(path: string) {
  return sendMessage("OPEN_EXTENSION_PAGE", { path });
}

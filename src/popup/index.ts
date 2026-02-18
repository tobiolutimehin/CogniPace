import { sendMessage } from "../shared/runtime";
import { QueueItem, StudyState } from "../shared/types";

interface DashboardData {
  queue: {
    dueCount: number;
    newCount: number;
    reinforcementCount: number;
    items: QueueItem[];
  };
  analytics: {
    streakDays: number;
  };
}

let allItems: QueueItem[] = [];
let activeFilter: "all" | "due" | "new" = "all";

function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`Missing element: ${id}`);
  }
  return node as T;
}

function formatStatus(state: StudyState): string {
  return `${state.status} · ease ${state.ease.toFixed(2)} · lapses ${state.lapses}`;
}

function formatNextReview(iso?: string): string {
  if (!iso) {
    return "Not scheduled";
  }
  return new Date(iso).toLocaleString();
}

function renderQueue(): void {
  const list = byId<HTMLUListElement>("queue-list");
  list.innerHTML = "";

  const filtered = allItems.filter((item) => {
    if (activeFilter === "all") {
      return true;
    }
    if (activeFilter === "due") {
      return item.category === "due";
    }
    return item.category === "new";
  });

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "queue-empty";
    empty.textContent = "No items in this view.";
    list.appendChild(empty);
    return;
  }

  for (const item of filtered) {
    const li = document.createElement("li");
    li.className = "queue-item";

    const titleButton = document.createElement("button");
    titleButton.className = "link-btn";
    titleButton.textContent = item.problem.title;
    titleButton.onclick = () => {
      chrome.tabs.create({ url: item.problem.url });
    };

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${item.problem.difficulty} · ${formatStatus(item.studyState)}`;

    const next = document.createElement("div");
    next.className = "next";
    next.textContent = `Next: ${formatNextReview(item.studyState.nextReviewAt)}`;

    li.appendChild(titleButton);
    li.appendChild(meta);
    li.appendChild(next);
    list.appendChild(li);
  }
}

function setFilter(filter: "all" | "due" | "new"): void {
  activeFilter = filter;
  for (const value of ["all", "due", "new"] as const) {
    const btn = byId<HTMLButtonElement>(`filter-${value}`);
    btn.dataset.active = value === filter ? "true" : "false";
  }
  renderQueue();
}

async function refresh(): Promise<void> {
  const response = await sendMessage("GET_DASHBOARD_DATA", {});
  if (!response.ok) {
    byId<HTMLElement>("error").textContent = response.error ?? "Failed to load queue";
    return;
  }

  byId<HTMLElement>("error").textContent = "";
  const data = response.data as DashboardData;

  allItems = data.queue.items;

  byId<HTMLElement>("due-count").textContent = String(data.queue.dueCount);
  byId<HTMLElement>("new-count").textContent = String(data.queue.newCount);
  byId<HTMLElement>("streak-count").textContent = String(data.analytics.streakDays);

  const nextDue = allItems.find((item) => item.studyState.nextReviewAt);
  byId<HTMLElement>("next-review").textContent = nextDue
    ? formatNextReview(nextDue.studyState.nextReviewAt)
    : "-";

  renderQueue();
}

async function addInputProblem(): Promise<void> {
  const inputEl = byId<HTMLInputElement>("manual-input");
  const input = inputEl.value.trim();
  if (!input) {
    return;
  }

  const response = await sendMessage("ADD_PROBLEM_BY_INPUT", { input });
  if (!response.ok) {
    byId<HTMLElement>("error").textContent = response.error ?? "Failed to add problem";
    return;
  }

  inputEl.value = "";
  await refresh();
}

async function addCurrentProblem(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) {
    byId<HTMLElement>("error").textContent = "No active tab URL.";
    return;
  }

  const response = await sendMessage("ADD_PROBLEM_BY_INPUT", { input: tab.url });
  if (!response.ok) {
    byId<HTMLElement>("error").textContent = response.error ?? "Current tab is not a LeetCode problem.";
    return;
  }

  await refresh();
}

function bindEvents(): void {
  byId<HTMLButtonElement>("filter-all").onclick = () => setFilter("all");
  byId<HTMLButtonElement>("filter-due").onclick = () => setFilter("due");
  byId<HTMLButtonElement>("filter-new").onclick = () => setFilter("new");

  byId<HTMLButtonElement>("manual-add-btn").onclick = () => {
    void addInputProblem();
  };

  byId<HTMLButtonElement>("add-current-btn").onclick = () => {
    void addCurrentProblem();
  };

  byId<HTMLButtonElement>("open-dashboard-btn").onclick = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
  };

  byId<HTMLButtonElement>("refresh-btn").onclick = () => {
    void refresh();
  };

  byId<HTMLInputElement>("manual-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      void addInputProblem();
    }
  });
}

bindEvents();
setFilter("all");
void refresh();

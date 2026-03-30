export type DashboardView =
  | "dashboard"
  | "courses"
  | "library"
  | "analytics"
  | "settings";

export interface DashboardRoute {
  copy: string;
  label: string;
  title: string;
  view: DashboardView;
}

export const dashboardRoutes: DashboardRoute[] = [
  {
    view: "dashboard",
    label: "Dashboard",
    title: "Dashboard",
    copy: "The best next move for retention and the live state of your active path.",
  },
  {
    view: "courses",
    label: "Courses",
    title: "Course Management",
    copy: "Curated-first traversal, chapter progression, and intake control.",
  },
  {
    view: "library",
    label: "Library",
    title: "Library",
    copy: "Inspect every tracked problem, its review state, and course membership.",
  },
  {
    view: "analytics",
    label: "Analytics",
    title: "Analytics",
    copy: "Retention, due load, weakest items, and course completion signals.",
  },
  {
    view: "settings",
    label: "Settings",
    title: "Control Center",
    copy: "Global configuration for review cadence, automation behavior, and alerts.",
  },
];

export function readDashboardViewFromSearch(search: string): DashboardView {
  const value = new URLSearchParams(search).get("view");
  return dashboardRoutes.some((route) => route.view === value)
    ? (value as DashboardView)
    : "dashboard";
}

export function getDashboardRoute(view: DashboardView): DashboardRoute {
  return (
    dashboardRoutes.find((route) => route.view === view) ?? dashboardRoutes[0]
  );
}

export function buildDashboardUrl(
  href: string,
  nextView: DashboardView
): string {
  const url = new URL(href);
  url.searchParams.set("view", nextView);
  return url.toString();
}

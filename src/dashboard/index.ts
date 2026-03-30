import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "../ui/providers";
import { DashboardApp } from "../ui/surfaces/dashboard/DashboardApp";

const mountNode = document.getElementById("app-shell");
if (!mountNode) {
  throw new Error("Missing dashboard root.");
}

createRoot(mountNode).render(
  createElement(
    StrictMode,
    null,
    createElement(AppProviders, null, createElement(DashboardApp))
  )
);

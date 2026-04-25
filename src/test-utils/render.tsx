import { render } from "@testing-library/react";
import React from "react";

import { AppProviders } from "../ui/providers";

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(<AppProviders>{ui}</AppProviders>, options);
}

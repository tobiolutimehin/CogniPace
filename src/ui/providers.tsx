import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

import { kineticTheme } from "./theme";

export function AppProviders(props: { children: ReactNode }) {
  return (
    <ThemeProvider theme={kineticTheme}>
      <CssBaseline enableColorScheme />
      {props.children}
    </ThemeProvider>
  );
}

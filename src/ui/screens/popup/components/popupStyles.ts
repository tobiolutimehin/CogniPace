import {alpha} from "@mui/material/styles";

import {kineticTokens} from "../../../theme";

export const popupShellSx = {
  backgroundColor: alpha(kineticTokens.backgroundAlt, 0.96),
  border: `1px solid ${alpha(kineticTokens.outlineStrong, 0.45)}`,
  borderRadius: 2.4,
  boxShadow: "0 24px 52px rgba(0, 0, 0, 0.34)",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
};

export const popupPanelSx = {
  backgroundColor: alpha(kineticTokens.paperStrong, 0.92),
  border: `1px solid ${alpha(kineticTokens.outlineStrong, 0.32)}`,
  borderRadius: 1.6,
  boxShadow: "none",
};

export const popupSectionLabelSx = {
  color: kineticTokens.text,
  fontSize: "0.64rem",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export const popupIconButtonSx = {
  border: `1px solid ${alpha(kineticTokens.outlineStrong, 0.34)}`,
  borderRadius: 1.15,
  color: kineticTokens.accent,
  height: 30,
  transition: "border-color 160ms ease, background-color 160ms ease, color 160ms ease",
  width: 30,
  "&:hover": {
    backgroundColor: alpha(kineticTokens.accent, 0.1),
    borderColor: alpha(kineticTokens.accentSoft, 0.45),
  },
  "&:focus-visible": {
    backgroundColor: alpha(kineticTokens.accent, 0.12),
    outline: `2px solid ${alpha(kineticTokens.info, 0.72)}`,
    outlineOffset: 2,
  },
};

export const popupActionButtonSx = {
  minHeight: 42,
  touchAction: "manipulation",
  "&:focus-visible": {
    outline: `2px solid ${alpha(kineticTokens.info, 0.72)}`,
    outlineOffset: 2,
  },
};

export const popupSmallButtonSx = {
  borderRadius: 999,
  minHeight: 28,
  px: 1.05,
  py: 0.2,
  touchAction: "manipulation",
  "&:focus-visible": {
    outline: `2px solid ${alpha(kineticTokens.info, 0.72)}`,
    outlineOffset: 2,
  },
};

export const popupMetricValueSx = {
  color: kineticTokens.text,
  fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif',
  fontVariantNumeric: "tabular-nums",
  fontSize: "1.85rem",
  fontWeight: 700,
  letterSpacing: "-0.04em",
  lineHeight: 0.95,
};

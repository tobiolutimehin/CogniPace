import RefreshRounded from "@mui/icons-material/RefreshRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { kineticTokens } from "../../../theme";

import { PopupBrandMark } from "./PopupBrandMark";
import { popupIconButtonSx } from "./popupStyles";

export interface PopupHeaderProps {
  onOpenSettings: () => void;
  onRefresh: () => void;
}

export function PopupHeader(props: PopupHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        borderBottom: `1px solid ${alpha(kineticTokens.outlineStrong, 0.24)}`,
        px: 1.4,
        py: 1.2,
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={1}
      >
        <Box sx={{ width: 30 }}>
          <PopupBrandMark />
        </Box>
        <Typography
          component="h1"
          sx={{
            color: kineticTokens.accent,
            flex: 1,
            fontFamily:
              '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif',
            fontSize: "1.02rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            textAlign: "center",
          }}
          translate="no"
        >
          CogniPace
        </Typography>
        <Stack direction="row" spacing={0.45}>
          <Tooltip title="Refresh popup">
            <IconButton
              aria-label="Refresh popup"
              onClick={props.onRefresh}
              size="small"
              sx={popupIconButtonSx}
            >
              <RefreshRounded aria-hidden="true" fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open settings">
            <IconButton
              aria-label="Open settings"
              onClick={props.onOpenSettings}
              size="small"
              sx={popupIconButtonSx}
            >
              <SettingsRounded aria-hidden="true" fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

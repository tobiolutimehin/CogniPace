/** Thin overlay surface switcher that keeps the compact inlay separate from the expanded panel. */
import CancelRounded from "@mui/icons-material/CancelRounded";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import {alpha} from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import {kineticTokens} from "../../theme";

import {ExpandedOverlayPanel} from "./ExpandedOverlayPanel";
import {OverlayPanelProps} from "./overlayPanel.types";

const timerTextSx = {
  fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif',
  fontWeight: 700,
  letterSpacing: "-0.06em",
  lineHeight: 1,
};

/** Renders the compact inlay or the expanded overlay surface. */
export function OverlayPanel(props: OverlayPanelProps) {
  if (!props.collapsed) {
    return <ExpandedOverlayPanel {...props}/>;
  }

  const collapsedTimerActionLabel = props.isTimerRunning
    ? "Pause timer"
    : props.canRestartSession && !props.canEditTimer
      ? "Start a new session"
      : "Start timer";
  const collapsedRestartLabel = "Restart timer";

  return (
    <Paper
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2.25,
        overflow: "hidden",
        width: 408,
      }}
    >
      <Stack spacing={1.1} sx={{p: 1.75}}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1.75}
        >
          <Stack alignItems="center" direction="row" spacing={0.9}>
            <Tooltip title="Expand overlay">
              <IconButton
                aria-label="Expand overlay"
                onClick={props.onToggleCollapse}
                size="small"
                sx={{
                  backgroundColor: alpha(kineticTokens.mutedText, 0.08),
                  border: `1px solid ${alpha(kineticTokens.mutedText, 0.16)}`,
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: alpha(kineticTokens.mutedText, 0.14),
                  },
                }}
              >
                <KeyboardArrowUpRounded fontSize="small"/>
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                alignSelf: "stretch",
                backgroundColor: (theme) => theme.palette.divider,
                borderRadius: 999,
                width: "1px",
              }}
            />
            <Typography
              component="div"
              sx={{
                ...timerTextSx,
                flexShrink: 0,
                fontSize: "2rem",
              }}
            >
              {props.timerDisplay}
            </Typography>
            <Tooltip title={collapsedTimerActionLabel}>
              <span>
                <IconButton
                  aria-label={collapsedTimerActionLabel}
                  disabled={!props.canEditTimer && !props.canRestartSession}
                  onClick={
                    props.isTimerRunning
                      ? props.onPauseTimer
                      : props.onStartTimer
                  }
                  size="small"
                  sx={{
                    backgroundColor: alpha(kineticTokens.accent, 0.12),
                    border: `1px solid ${alpha(kineticTokens.accentSoft, 0.2)}`,
                    color: "primary.light",
                    "&:hover": {
                      backgroundColor: alpha(kineticTokens.accent, 0.2),
                    },
                  }}
                >
                  {props.isTimerRunning ? (
                    <PauseRounded fontSize="small"/>
                  ) : (
                    <PlayArrowRounded fontSize="small"/>
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={collapsedRestartLabel}>
              <span>
                <IconButton
                  aria-label={collapsedRestartLabel}
                  disabled={!props.canResetTimer}
                  onClick={props.onResetTimer}
                  size="small"
                  sx={{
                    backgroundColor: alpha(kineticTokens.mutedText, 0.08),
                    border: `1px solid ${alpha(kineticTokens.mutedText, 0.16)}`,
                    color: "text.secondary",
                    "&:hover": {
                      backgroundColor: alpha(kineticTokens.mutedText, 0.14),
                    },
                  }}
                >
                  <RestartAltRounded fontSize="small"/>
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={0.75}>
            <Button
              disabled={!props.canSubmit}
              onClick={props.onCompactSubmit}
              size="small"
              variant="contained"
            >
              Submit
            </Button>
            <Tooltip title="Fail review">
              <span>
                <IconButton
                  aria-label="Fail review"
                  disabled={!props.canSubmit}
                  onClick={props.onFailReview}
                  size="small"
                  sx={{
                    backgroundColor: kineticTokens.danger,
                    borderRadius: 1.1,
                    boxShadow: `0 12px 24px ${alpha(kineticTokens.danger, 0.18)}`,
                    color: kineticTokens.background,
                    height: 34,
                    width: 34,
                    "&:hover": {
                      backgroundColor: "#ffc3bb",
                    },
                  }}
                >
                  <CancelRounded fontSize="small"/>
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

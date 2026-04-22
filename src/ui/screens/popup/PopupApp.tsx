/** Popup screen composition for the compact extension surface. */
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";

import { kineticTokens } from "../../theme";

import { PopupCourseSection } from "./components/PopupCourseSection";
import { PopupHeader } from "./components/PopupHeader";
import { PopupMetricTile } from "./components/PopupMetricTile";
import { PopupRecommendationSection } from "./components/PopupRecommendationSection";
import { popupShellSx } from "./components/popupStyles";
import { usePopupController } from "./usePopupController";

export function PopupApp() {
  const controller = usePopupController();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        p: 1.1,
        width: 380,
      }}
    >
      <Paper sx={popupShellSx}>
        <PopupHeader
          onOpenSettings={controller.onOpenSettings}
          onRefresh={() => {
            void controller.refresh(true);
          }}
        />

        <Box
          sx={{
            p: 1.25,
          }}
        >
          <Stack spacing={1.2}>
            <Grid container spacing={1.25}>
              <Grid size={6}>
                <PopupMetricTile
                  accent={kineticTokens.danger}
                  label="Due Today"
                  value={controller.payload?.popup.dueCount ?? 0}
                />
              </Grid>
              <Grid size={6}>
                <PopupMetricTile
                  accent={kineticTokens.accentSoft}
                  label="Streak"
                  suffix="days"
                  value={controller.payload?.popup.streakDays ?? 0}
                />
              </Grid>
            </Grid>

            <PopupRecommendationSection
              canShuffle={controller.hasMultipleRecommended}
              onOpenProblem={controller.onOpenProblem}
              onShuffle={controller.shuffleRecommendation}
              recommended={controller.recommended}
            />

            <PopupCourseSection
              course={controller.activeCourseDetail}
              isModeActionDisabled={controller.isUpdatingStudyMode}
              mode={controller.studyMode}
              nextQuestion={controller.courseNext}
              onEnterFreestyle={() => {
                void controller.setStudyMode("freestyle");
              }}
              onOpenCourseDashboard={controller.openCoursesDashboard}
              onOpenProblem={controller.onOpenProblem}
              onReturnToStudyMode={() => {
                void controller.setStudyMode("studyPlan");
              }}
            />
          </Stack>
        </Box>
      </Paper>

      {controller.status.message ? (
        <Alert
          aria-live="polite"
          severity={controller.status.isError ? "error" : "info"}
          sx={{
            border: `1px solid ${alpha(kineticTokens.outlineStrong, 0.28)}`,
            borderRadius: 1.4,
          }}
          variant="filled"
        >
          {controller.status.message}
        </Alert>
      ) : null}
    </Box>
  );
}

import CallMadeRounded from "@mui/icons-material/CallMadeRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { StudyMode } from "../../../../domain/types";
import { ActiveCourseView, CourseQuestionView } from "../../../../domain/views";
import { kineticTokens } from "../../../theme";

import {
  popupIconButtonSx,
  popupPanelSx,
  popupSmallButtonSx,
  popupSectionLabelSx,
} from "./popupStyles";

import type { ReactNode } from "react";

interface PopupCourseActionProps {
  courseId: string;
  nextQuestion: CourseQuestionView;
  onOpenProblem: (target: {
    slug: string;
    courseId?: string;
    chapterId?: string;
  }) => Promise<void> | void;
}

function PopupCourseAction(props: PopupCourseActionProps) {
  return (
    <Tooltip title="Continue path">
      <IconButton
        aria-label="Continue path"
        onClick={() => {
          void props.onOpenProblem({
            chapterId: props.nextQuestion.chapterId,
            courseId: props.courseId,
            slug: props.nextQuestion.slug,
          });
        }}
        size="small"
        sx={{
          ...popupIconButtonSx,
          borderColor: alpha(kineticTokens.accent, 0.42),
          color: kineticTokens.accent,
          height: 28,
          width: 28,
        }}
      >
        <ChevronRightRounded aria-hidden="true" fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function PopupCoursePanelChrome(props: {
  children: ReactNode;
  isModeActionDisabled?: boolean;
  modeActionLabel: string;
  onModeAction: () => void;
  onOpenCourseDashboard: () => void;
  title?: string;
}) {
  return (
    <Box
      sx={{
        ...popupPanelSx,
        height: 222,
        p: 1.35,
      }}
    >
      <Stack
        sx={{
          height: "100%",
        }}
      >
        <Stack spacing={1.2}>
          <Typography sx={popupSectionLabelSx}>
            {props.title ?? "Active Course"}
          </Typography>
          {props.children}
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={0.8}
          sx={{
            mt: "auto",
          }}
        >
          <Button
            disabled={props.isModeActionDisabled}
            onClick={props.onModeAction}
            size="small"
            sx={{
              ...popupSmallButtonSx,
              flex: 1,
              justifyContent: "center",
            }}
            variant="outlined"
          >
            {props.modeActionLabel}
          </Button>
          <Tooltip title="Open courses dashboard">
            <IconButton
              aria-label="Open courses dashboard"
              onClick={props.onOpenCourseDashboard}
              size="small"
              sx={popupIconButtonSx}
            >
              <CallMadeRounded aria-hidden="true" fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

function EmptyCoursePanel(props: {
  isModeActionDisabled?: boolean;
  onEnterFreestyle: () => void;
  onOpenCourseDashboard: () => void;
}) {
  return (
    <PopupCoursePanelChrome
      isModeActionDisabled={props.isModeActionDisabled}
      modeActionLabel="Start freestyle mode"
      onModeAction={props.onEnterFreestyle}
      onOpenCourseDashboard={props.onOpenCourseDashboard}
    >
      <Stack spacing={0.7}>
        <Typography component="h2" variant="h6">
          No Active Course
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Choose a course in the dashboard to restore the guided path.
        </Typography>
      </Stack>
    </PopupCoursePanelChrome>
  );
}

function CompletedCoursePanel(props: {
  course: ActiveCourseView;
  isModeActionDisabled?: boolean;
  onEnterFreestyle: () => void;
  onOpenCourseDashboard: () => void;
}) {
  return (
    <PopupCoursePanelChrome
      isModeActionDisabled={props.isModeActionDisabled}
      modeActionLabel="Start freestyle mode"
      onModeAction={props.onEnterFreestyle}
      onOpenCourseDashboard={props.onOpenCourseDashboard}
    >
      <Stack spacing={0.7}>
        <Typography component="h2" variant="h6">
          {props.course.name}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Course complete. Switch tracks in the dashboard or stay focused on due
          reviews.
        </Typography>
      </Stack>
    </PopupCoursePanelChrome>
  );
}

function StudyPlanCoursePanel(props: {
  course: ActiveCourseView;
  isModeActionDisabled?: boolean;
  nextQuestion: CourseQuestionView;
  onEnterFreestyle: () => void;
  onOpenCourseDashboard: () => void;
  onOpenProblem: (target: {
    slug: string;
    courseId?: string;
    chapterId?: string;
  }) => Promise<void> | void;
}) {
  return (
    <PopupCoursePanelChrome
      isModeActionDisabled={props.isModeActionDisabled}
      modeActionLabel="Start freestyle mode"
      onModeAction={props.onEnterFreestyle}
      onOpenCourseDashboard={props.onOpenCourseDashboard}
    >
      <Stack spacing={1.2}>
        <Typography
          color="primary.light"
          component="h2"
          sx={{
            fontSize: "0.98rem",
            fontWeight: 700,
            lineHeight: 1.16,
          }}
        >
          {props.course.name}
        </Typography>

        <Stack spacing={0.6}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography sx={popupSectionLabelSx}>Progress</Typography>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: "0.8rem",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
              }}
            >
              {props.course.completionPercent}%
            </Typography>
          </Stack>
          <LinearProgress
            value={props.course.completionPercent}
            variant="determinate"
          />
        </Stack>

        <Box
          sx={{
            backgroundColor: alpha(kineticTokens.background, 0.34),
            border: `1px solid ${alpha(kineticTokens.outlineStrong, 0.22)}`,
            borderRadius: 1.2,
            p: 1.1,
          }}
        >
          <Stack spacing={0.6}>
            <Typography sx={popupSectionLabelSx}>Up Next</Typography>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                sx={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  lineHeight: 1.22,
                }}
                translate="no"
              >
                {props.nextQuestion.title}
              </Typography>
              <PopupCourseAction
                courseId={props.course.id}
                nextQuestion={props.nextQuestion}
                onOpenProblem={props.onOpenProblem}
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </PopupCoursePanelChrome>
  );
}

export interface PopupCourseSectionProps {
  course: ActiveCourseView | null;
  isModeActionDisabled?: boolean;
  mode: StudyMode;
  nextQuestion: CourseQuestionView | null;
  onEnterFreestyle: () => void;
  onOpenCourseDashboard: () => void;
  onOpenProblem: (target: {
    slug: string;
    courseId?: string;
    chapterId?: string;
  }) => Promise<void> | void;
  onReturnToStudyMode: () => void;
}

export function PopupCourseSection(props: PopupCourseSectionProps) {
  if (props.mode === "freestyle") {
    return (
      <PopupCoursePanelChrome
        isModeActionDisabled={props.isModeActionDisabled}
        modeActionLabel="Start study mode"
        onModeAction={props.onReturnToStudyMode}
        onOpenCourseDashboard={props.onOpenCourseDashboard}
      >
        <Stack spacing={0.7}>
          <Typography component="h2" variant="h6">
            You are in free style mode
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Start study mode to resume your guided course progression.
          </Typography>
        </Stack>
      </PopupCoursePanelChrome>
    );
  }

  if (!props.course) {
    return (
      <EmptyCoursePanel
        isModeActionDisabled={props.isModeActionDisabled}
        onEnterFreestyle={props.onEnterFreestyle}
        onOpenCourseDashboard={props.onOpenCourseDashboard}
      />
    );
  }

  if (!props.nextQuestion) {
    return (
      <CompletedCoursePanel
        course={props.course}
        isModeActionDisabled={props.isModeActionDisabled}
        onEnterFreestyle={props.onEnterFreestyle}
        onOpenCourseDashboard={props.onOpenCourseDashboard}
      />
    );
  }

  return (
    <StudyPlanCoursePanel
      course={props.course}
      isModeActionDisabled={props.isModeActionDisabled}
      nextQuestion={props.nextQuestion}
      onEnterFreestyle={props.onEnterFreestyle}
      onOpenCourseDashboard={props.onOpenCourseDashboard}
      onOpenProblem={props.onOpenProblem}
    />
  );
}

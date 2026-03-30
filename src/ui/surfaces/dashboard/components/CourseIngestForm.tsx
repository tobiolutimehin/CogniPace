
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { FormEvent, useState } from "react";

import { AppShellPayload } from "../../../../shared/types";

export interface CourseFormState {
  chapterId: string;
  courseId: string;
  input: string;
  markAsStarted: boolean;
}

export function resolveCourseForm(
  payload: AppShellPayload | null,
  previous: CourseFormState
): CourseFormState {
  const options = payload?.courseOptions ?? [];
  const selectedCourse =
    options.find((course) => course.id === previous.courseId) ?? options[0];

  if (!selectedCourse) {
    return {
      ...previous,
      chapterId: "",
      courseId: "",
    };
  }

  const selectedChapter =
    selectedCourse.chapterOptions.find(
      (chapter) => chapter.id === previous.chapterId
    ) ?? selectedCourse.chapterOptions[0];

  return {
    ...previous,
    chapterId: selectedChapter?.id ?? "",
    courseId: selectedCourse.id,
  };
}

export interface CourseIngestFormProps {
  onSubmit: (state: CourseFormState) => Promise<boolean>;
  payload: AppShellPayload | null;
}

export function CourseIngestForm(props: CourseIngestFormProps) {
  const [formState, setFormState] = useState<CourseFormState>({
    chapterId: "",
    courseId: "",
    input: "",
    markAsStarted: false,
  });
  const resolvedForm = resolveCourseForm(props.payload, formState);
  const options = props.payload?.courseOptions ?? [];
  const selectedCourse =
    options.find((course) => course.id === resolvedForm.courseId) ?? options[0];

  return (
    <Box
      component="form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void props.onSubmit(resolvedForm).then((completed) => {
          if (completed) {
            setFormState((current) => ({
              ...current,
              input: "",
              markAsStarted: false,
            }));
          }
        });
      }}
    >
      <Stack spacing={1.5}>
        <FormControl fullWidth>
          <InputLabel id="course-form-course-label">Course</InputLabel>
          <Select
            label="Course"
            labelId="course-form-course-label"
            onChange={(event) => {
              const nextCourseId = event.target.value;
              setFormState((current) => {
                const nextCourse =
                  options.find((course) => course.id === nextCourseId) ??
                  options[0];
                return {
                  ...current,
                  chapterId: nextCourse?.chapterOptions[0]?.id ?? "",
                  courseId: nextCourseId,
                };
              });
            }}
            value={resolvedForm.courseId}
          >
            {options.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="course-form-chapter-label">Chapter</InputLabel>
          <Select
            label="Chapter"
            labelId="course-form-chapter-label"
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                chapterId: event.target.value,
              }));
            }}
            value={resolvedForm.chapterId}
          >
            {(selectedCourse?.chapterOptions ?? []).map((chapter) => (
              <MenuItem key={chapter.id} value={chapter.id}>
                {chapter.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="LeetCode Slug or URL"
          onChange={(event) => {
            setFormState((current) => ({
              ...current,
              input: event.target.value,
            }));
          }}
          placeholder="https://leetcode.com/problems/..."
          value={formState.input}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formState.markAsStarted}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  markAsStarted: event.target.checked,
                }));
              }}
            />
          }
          label="Mark as started"
        />
        <Button type="submit" variant="contained">
          Add To Protocol
        </Button>
      </Stack>
    </Box>
  );
}

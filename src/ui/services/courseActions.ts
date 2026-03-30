import { sendMessage } from "../../shared/runtime";

export async function switchActiveCourse(courseId: string) {
  return sendMessage("SWITCH_ACTIVE_COURSE", { courseId });
}

export async function setActiveCourseChapter(
  courseId: string,
  chapterId: string
) {
  return sendMessage("SET_ACTIVE_COURSE_CHAPTER", {
    courseId,
    chapterId,
  });
}

export async function addProblemToCourse(input: {
  courseId: string;
  chapterId: string;
  input: string;
  markAsStarted?: boolean;
}) {
  return sendMessage("ADD_PROBLEM_TO_COURSE", input);
}

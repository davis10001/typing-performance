import type { LearningScope } from "./repository";
import { englishQwertyCourse } from "./course-content";
import { PARAGRAPH_CONTENT_REVISION } from "./paragraph-content";

export const KEYBR_REVISION = "05a37bc5265f65ff538c59c613db29442f345d51";
export const KEYBR_CONTENT_REVISION = "4a389241e2f05a9d62a0e9f34bafc5f333cf08dda100c80805bda8a39550376b";
export const KTOUCH_REVISION = "a3f57d03e6c14956378af1176eef3404430c773e";

export const guidedLearningScope: LearningScope = {
  mode: "guided",
  engineRevision: KEYBR_REVISION,
  contentRevision: KEYBR_CONTENT_REVISION,
  layout: "en-us",
};

export const courseLearningScope: LearningScope = {
  mode: "course",
  engineRevision: KTOUCH_REVISION,
  contentRevision: englishQwertyCourse.contentRevision,
  layout: englishQwertyCourse.sourceLayout,
};

export const paragraphLearningScope: LearningScope = {
  mode: "paragraph",
  engineRevision: KTOUCH_REVISION,
  contentRevision: PARAGRAPH_CONTENT_REVISION,
  layout: "en-us",
};

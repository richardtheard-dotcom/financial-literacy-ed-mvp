import type { Course, UserProfile } from "./types";
import { COURSES, COURSE_PREREQUISITES } from "./data/courses";

/**
 * Local Filtering Rule Engine — direct port of engine.js
 * Evaluates the course catalog against the user profile using deterministic rules.
 * Returns up to 3 matching open-frontier nodes (courses with no unmet prerequisites
 * and matching income band + vulnerability tags).
 */
export function calculateLocalFrontierRoadmap(
  userProfile: UserProfile,
  completedCourseIds: string[]
): Course[] {
  const openFrontierNodes: Course[] = [];

  for (const course of COURSES) {
    if (completedCourseIds.includes(course.id)) continue;

    const dependencies = COURSE_PREREQUISITES.filter(
      (p) => p.course_id === course.id
    );
    let hasUnmetPrereq = false;
    for (const req of dependencies) {
      if (!completedCourseIds.includes(req.requires_prerequisite_id)) {
        hasUnmetPrereq = true;
        break;
      }
    }
    if (hasUnmetPrereq) continue;

    const profileIncomeBand = userProfile.incomeBandV2 || userProfile.incomeBand;
    const incomeMatches =
      course.income_band_target.includes("all") ||
      course.income_band_target.includes(profileIncomeBand);

    const tags = userProfile.vulnerabilityTags ?? [];
    const vulnerabilityMatches = course.vulnerability_focus.some((tag) =>
      tags.includes(tag)
    );

    if (incomeMatches && vulnerabilityMatches) {
      openFrontierNodes.push(course);
    }
  }

  return openFrontierNodes.slice(0, 3);
}

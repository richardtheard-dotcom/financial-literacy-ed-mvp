/**
 * Local Filtering Rule Engine
 * Evaluates courses against the local user profile using clear, deterministic code logic.
 */
function calculateLocalFrontierRoadmap(userProfile, completedCourseIds) {
  const openFrontierNodes = [];

  // Ensure course list is referenceable from global or default
  const courseList = typeof COURSES !== 'undefined' ? COURSES : [];

  for (const course of courseList) {
    // 1. Skip courses the user has already finished
    if (completedCourseIds.includes(course.id)) {
      continue;
    }

    // 2. Evaluate structural course dependencies (Prerequisites)
    const dependencies = typeof COURSE_PREREQUISITES !== 'undefined' ? COURSE_PREREQUISITES.filter(p => p.course_id === course.id) : [];
    let hasUnmetPrereq = false;
    for (const req of dependencies) {
      if (!completedCourseIds.includes(req.requires_prerequisite_id)) {
        hasUnmetPrereq = true;
        break;
      }
    }
    if (hasUnmetPrereq) continue;

    // 3. Match user demographic indicators (Income Bands)
    const profileIncomeBand = userProfile.incomeBandV2 || userProfile.incomeBand;
    const incomeMatches = course.income_band_target.includes("all") || 
                          course.income_band_target.includes(profileIncomeBand);

    // 4. Match behavioral indicators (Vulnerability Tags)
    const tags = userProfile.vulnerabilityTags || [];
    const vulnerabilityMatches = course.vulnerability_focus.some(tag => 
      tags.includes(tag)
    );

    // If both profile constraints clear, hold item for priority recommendation
    if (incomeMatches && vulnerabilityMatches) {
      openFrontierNodes.push(course);
    }
  }

  // Enforce cognitive limitation cap rule: strictly return the top 2-3 matching nodes
  return openFrontierNodes.slice(0, 3);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateLocalFrontierRoadmap };
}

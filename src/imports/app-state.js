const APP_STATE_KEY = "fined_state_v1";

const defaultState = {
  profile: null,
  recommendations: [],
  currentCourseId: null,
  progress: {
    streak: 0,
    completedCourses: [],
    lastActiveDate: null,
    reassessmentCount: 0,
    // NEW: tracks which lesson index a user is on inside a multi-lesson course.
    // Shape: { [courseId]: currentLessonIndex }
    lessonProgress: {}
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      progress: {
        ...structuredClone(defaultState.progress),
        ...(parsed.progress || {}),
        lessonProgress: {
          ...structuredClone(defaultState.progress.lessonProgress),
          ...((parsed.progress && parsed.progress.lessonProgress) || {})
        }
      }
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem(APP_STATE_KEY);
}

function updateState(mutator) {
  const state = loadState();
  mutator(state);
  saveState(state);
  return state;
}

function isCompleteToday(lastActiveDate) {
  if (!lastActiveDate) return false;
  const last = new Date(lastActiveDate);
  const today = new Date();
  return last.toDateString() === today.toDateString();
}

function updateStreak() {
  return updateState((state) => {
    const today = new Date();
    const last = state.progress.lastActiveDate ? new Date(state.progress.lastActiveDate) : null;
    if (!last) {
      state.progress.streak = 1;
    } else {
      const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) state.progress.streak += 1;
      if (diffDays > 1) state.progress.streak = 1;
    }
    state.progress.lastActiveDate = today.toISOString();
  });
}

// NEW: lesson-level progress helpers, used by the multi-lesson course player.
function getLessonIndex(state, courseId) {
  return state.progress.lessonProgress[courseId] || 0;
}

function setLessonIndex(courseId, index) {
  return updateState((state) => {
    state.progress.lessonProgress[courseId] = index;
  });
}

// Global state event callbacks
window.onCourseReady = window.onCourseReady || function(config) {
  console.log("State Change Event: onCourseReady()", config);
};
window.onCourseBuilt = window.onCourseBuilt || function(course) {
  console.log("State Change Event: onCourseBuilt()", course);
};
window.onCourseLoaded = window.onCourseLoaded || function(courseId) {
  console.log("State Change Event: onCourseLoaded()", courseId);
};


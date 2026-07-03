import { useState, useCallback } from "react";
import type { AppState, UserProfile, Course } from "./types";

const STATE_KEY = "fined_state_v1";

const defaultState: AppState = {
  profile: null,
  recommendations: [],
  currentCourseId: null,
  progress: {
    streak: 0,
    completedCourses: [],
    lastActiveDate: null,
    reassessmentCount: 0,
    lessonProgress: {},
  },
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...structuredClone(defaultState),
      ...parsed,
      progress: {
        ...structuredClone(defaultState.progress),
        ...(parsed.progress ?? {}),
        lessonProgress: {
          ...structuredClone(defaultState.progress.lessonProgress),
          ...((parsed.progress?.lessonProgress) ?? {}),
        },
      },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function resetState(): void {
  localStorage.removeItem(STATE_KEY);
}

export function mutateState(mutator: (s: AppState) => void): AppState {
  const state = loadState();
  mutator(state);
  saveState(state);
  return state;
}

export function isCompleteToday(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return false;
  return new Date(lastActiveDate).toDateString() === new Date().toDateString();
}

export function computeUpdatedStreak(state: AppState): AppState {
  return mutateState((s) => {
    const today = new Date();
    const last = s.progress.lastActiveDate ? new Date(s.progress.lastActiveDate) : null;
    if (!last) {
      s.progress.streak = 1;
    } else {
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) s.progress.streak += 1;
      if (diffDays > 1) s.progress.streak = 1;
    }
    s.progress.lastActiveDate = today.toISOString();
  });
}

export function getLessonIndex(state: AppState, courseId: string): number {
  return state.progress.lessonProgress[courseId] ?? 0;
}

export function setLessonIndex(courseId: string, index: number): AppState {
  return mutateState((s) => {
    s.progress.lessonProgress[courseId] = index;
  });
}

// ── React hook ───────────────────────────────────────────────────────────────

export interface AppStateHook {
  state: AppState;
  saveProfile: (profile: UserProfile, recommendations: Course[]) => void;
  completeCourse: (courseId: string) => AppState;
  updateLessonIndex: (courseId: string, index: number) => void;
  clearAll: () => void;
  refresh: () => void;
}

export function useAppState(): AppStateHook {
  const [state, setStateRaw] = useState<AppState>(() => loadState());

  const refresh = useCallback(() => {
    setStateRaw(loadState());
  }, []);

  const saveProfile = useCallback((profile: UserProfile, recommendations: Course[]) => {
    const next = mutateState((s) => {
      s.profile = profile;
      s.recommendations = recommendations;
      s.progress.reassessmentCount = (s.progress.reassessmentCount ?? 0);
    });
    setStateRaw({ ...next });
  }, []);

  const completeCourse = useCallback((courseId: string): AppState => {
    const streaked = computeUpdatedStreak(loadState());
    const next = mutateState((s) => {
      if (!s.progress.completedCourses.includes(courseId)) {
        s.progress.completedCourses.push(courseId);
      }
      s.currentCourseId = courseId;
      s.progress.streak = streaked.progress.streak;
      s.progress.lastActiveDate = streaked.progress.lastActiveDate;
    });
    setStateRaw({ ...next });
    return next;
  }, []);

  const updateLessonIndex = useCallback((courseId: string, index: number) => {
    const next = setLessonIndex(courseId, index);
    setStateRaw({ ...next });
  }, []);

  const clearAll = useCallback(() => {
    resetState();
    setStateRaw(structuredClone(defaultState));
  }, []);

  return { state, saveProfile, completeCourse, updateLessonIndex, clearAll, refresh };
}

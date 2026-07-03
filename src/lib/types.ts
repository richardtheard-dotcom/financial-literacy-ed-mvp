// ── Lesson types ────────────────────────────────────────────────────────────

export type LessonType =
  | "text_block"
  | "bullet_flow"
  | "interactive_isolation"
  | "quiz_assessment";

export interface IsolationOption {
  id: string;
  label: string;
  correct: boolean;
}

export interface Lesson {
  id: string;
  sort_order: number;
  title: string;
  type: LessonType;
  // text_block
  heading?: string;
  body?: string;
  // bullet_flow
  points?: string[];
  // interactive_isolation
  instruction?: string;
  options?: IsolationOption[];
  // quiz_assessment
  question?: string;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
}

// ── Course types ────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  category_id?: string;
  title: string;
  description: string;
  duration?: string;
  duration_label?: string;
  behaviorTag?: string;
  income_band_target: string[];
  vulnerability_focus: string[];
  version?: number;
  objectives?: string[];
  // legacy single-view fields
  content?: string[];
  quiz?: { question: string; choices: string[] };
  // new multi-lesson field
  lessons?: Lesson[];
  // recommendation display
  reason?: string;
  locked?: boolean;
}

export interface CoursePrerequisite {
  course_id: string;
  requires_prerequisite_id: string;
}

// ── Profile types ───────────────────────────────────────────────────────────

export interface ProfileSignals {
  knowledgeScore: number;
  behaviorScore: number;
  confidenceScore: number;
}

export interface ProfileBenchmark {
  incomeLabel: string;
  vulnerabilityIndex: string;
  emergencyFundRate: number;
  billStrainRate: number;
  stateName: string;
  strainLabel: string;
}

export interface UserProfile {
  name: string;
  email: string;
  incomeBand: string;
  goal: string;
  learningStyle: string;
  state: string;
  zip: string;
  household: string;
  immigration: string;
  community: string;
  signals: ProfileSignals;
  incomeBandV2: string;
  vulnerabilityTags: string[];
  benchmark: ProfileBenchmark;
}

// ── Progress types ──────────────────────────────────────────────────────────

export interface AppProgress {
  streak: number;
  completedCourses: string[];
  lastActiveDate: string | null;
  reassessmentCount: number;
  lessonProgress: Record<string, number>;
}

export interface AppState {
  profile: UserProfile | null;
  recommendations: Course[];
  currentCourseId: string | null;
  progress: AppProgress;
}

// ── Onboarding form data ────────────────────────────────────────────────────

export interface OnboardingFormData {
  // Step 0: Account
  name: string;
  email: string;
  // Step 1: Quiz
  q1: string;
  q2: string;
  q3: string;
  // Step 2: Habits
  bills: string;
  emergencyFund: string;
  overspending: string;
  overdrafts: string;
  borrowing: string;
  // Step 3: Goals
  incomeBand: string;
  goal: string;
  learningStyle: string;
  confidence: number;
  // Step 4: Location
  state: string;
  zip: string;
  household: string;
  immigration: string;
  community: string;
}

// ── Course builder session ──────────────────────────────────────────────────

export interface CourseBuilderConfig {
  topic: string;
  depth: string;
  format: string;
  objective: string;
}

// ── App navigation ──────────────────────────────────────────────────────────

export type AppScreen = "onboarding" | "dashboard" | "course" | "progress";

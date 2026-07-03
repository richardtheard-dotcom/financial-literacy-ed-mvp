import { useState, useEffect } from "react";
import type { AppScreen, Course, UserProfile } from "../lib/types";
import { useAppState } from "../lib/state";
import { getCourseById } from "../lib/data/courses";
import { OnboardingScreen } from "../components/screens/OnboardingScreen";
import { DashboardScreen } from "../components/screens/DashboardScreen";
import { CoursePlayerScreen } from "../components/screens/CoursePlayerScreen";
import { ProgressScreen } from "../components/screens/ProgressScreen";

// ── Phone frame ───────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[340px] h-[680px] rounded-[44px] bg-foreground shadow-2xl p-[2.5px]">
      {/* Notch */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground rounded-full z-10" />
      {/* Screen */}
      <div className="w-full h-full rounded-[41.5px] overflow-hidden bg-background relative">
        {children}
      </div>
      {/* Side buttons */}
      <div className="absolute left-[-3px] top-28 w-[3px] h-8 bg-foreground/70 rounded-l-sm" />
      <div className="absolute left-[-3px] top-40 w-[3px] h-12 bg-foreground/70 rounded-l-sm" />
      <div className="absolute right-[-3px] top-32 w-[3px] h-14 bg-foreground/70 rounded-r-sm" />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { state, saveProfile, completeCourse, updateLessonIndex, clearAll, refresh } = useAppState();
  const [screen, setScreen] = useState<AppScreen>("onboarding");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);

  // Determine initial screen from persisted state
  useEffect(() => {
    if (state.profile) {
      setScreen("dashboard");
    } else {
      setScreen("onboarding");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (s: AppScreen) => setScreen(s);

  const handleOnboardingComplete = (profile: UserProfile, recommendations: Course[]) => {
    saveProfile(profile, recommendations);
    setScreen("dashboard");
  };

  const handleOpenCourse = (courseId: string, generated?: Course) => {
    setActiveCourseId(courseId);
    if (generated) setGeneratedCourse(generated);
    setScreen("course");
  };

  const handleCompleteCourse = (courseId: string) => {
    completeCourse(courseId);
  };

  const handleReassess = () => {
    clearAll();
    setScreen("onboarding");
    setActiveCourseId(null);
    setGeneratedCourse(null);
  };

  const handleClearAll = () => {
    clearAll();
    setScreen("onboarding");
    setActiveCourseId(null);
    setGeneratedCourse(null);
  };

  const activeCourse =
    activeCourseId != null
      ? (generatedCourse && generatedCourse.id === activeCourseId
          ? generatedCourse
          : getCourseById(activeCourseId, generatedCourse) ?? null)
      : null;

  return (
    <div className="min-h-screen bg-[#EAECF0] flex items-center justify-center px-6 py-10">
      {/* Background grid texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #111827 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #111827 0px, transparent 1px, transparent 40px)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Wordmark above phone */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
            Fin<span className="text-primary">Ed</span>
          </h1>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {screen === "onboarding" && "Personalized financial learning"}
            {screen === "dashboard" && `Welcome back${state.profile ? ", " + state.profile.name.split(" ")[0] : ""}`}
            {screen === "course" && (activeCourse?.title ?? "Lesson player")}
            {screen === "progress" && "Track your learning streak"}
          </p>
        </div>

        {/* Phone */}
        <PhoneFrame>
          {screen === "onboarding" && (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          )}

          {screen === "dashboard" && (
            <DashboardScreen
              state={state}
              onOpenCourse={handleOpenCourse}
              onNavigate={navigate}
            />
          )}

          {screen === "course" && activeCourse && (
            <CoursePlayerScreen
              course={activeCourse}
              appState={state}
              onUpdateLessonIndex={updateLessonIndex}
              onCompleteCourse={handleCompleteCourse}
              onBack={() => {
                refresh();
                setScreen("dashboard");
              }}
            />
          )}

          {screen === "course" && !activeCourse && (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <p className="text-[13px] font-display font-bold text-foreground mb-2">Course not found</p>
              <button
                onClick={() => setScreen("dashboard")}
                className="text-[11px] font-mono text-primary hover:underline"
              >
                ← Back to dashboard
              </button>
            </div>
          )}

          {screen === "progress" && (
            <ProgressScreen
              state={state}
              onReassess={handleReassess}
              onClearAll={handleClearAll}
              onNavigate={navigate}
            />
          )}
        </PhoneFrame>

        {/* Screen name indicator */}
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
          {screen === "onboarding" && "Offline-first · Locally encrypted · Device only"}
          {screen === "dashboard" && "Your personalized roadmap"}
          {screen === "course" && "Multi-lesson player · Progress saved"}
          {screen === "progress" && "Streak & completion tracker"}
        </p>
      </div>
    </div>
  );
}

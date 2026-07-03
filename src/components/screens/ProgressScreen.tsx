import { Flame, BookOpen, RefreshCw, Trash2, ChevronRight } from "lucide-react";
import type { AppState } from "../../lib/types";
import { COURSES } from "../../lib/data/courses";
import { isCompleteToday } from "../../lib/state";

interface ProgressScreenProps {
  state: AppState;
  onReassess: () => void;
  onClearAll: () => void;
  onNavigate: (screen: "dashboard") => void;
}

export function ProgressScreen({ state, onReassess, onClearAll, onNavigate }: ProgressScreenProps) {
  const { progress, profile } = state;
  const completed = progress.completedCourses ?? [];
  const totalCourses = COURSES.length;
  const completedCourseNames = completed.map((id) => {
    const course = COURSES.find((c) => c.id === id);
    return course ? course.title : id;
  });

  const nextCourse = COURSES.find((c) => !completed.includes(c.id));
  const pct = totalCourses > 0 ? Math.round((completed.length / totalCourses) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <span className="font-display text-lg font-extrabold text-foreground tracking-tight">
          Fin<span className="text-primary">Ed</span>
        </span>
        <span className="text-[10px] font-mono font-medium tracking-[0.1em] uppercase text-muted-foreground">
          Progress
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">

        {/* Streak + completion grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <div className="bg-card border border-border rounded-xl px-4 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={13} className="text-orange-500" />
              <span className="text-[10px] font-mono font-medium uppercase tracking-wide text-muted-foreground">Streak</span>
            </div>
            <p className="text-3xl font-display font-extrabold text-foreground leading-none mb-1">
              {progress.streak ?? 0}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">days</p>
            <p className="text-[11px] text-muted-foreground mt-2 leading-tight">
              {isCompleteToday(progress.lastActiveDate)
                ? "Active today ✓"
                : "Return today to keep streak going"}
            </p>
          </div>

          {/* Completion */}
          <div className="bg-card border border-border rounded-xl px-4 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={13} className="text-primary" />
              <span className="text-[10px] font-mono font-medium uppercase tracking-wide text-muted-foreground">Courses</span>
            </div>
            <p className="text-3xl font-display font-extrabold text-foreground leading-none mb-1">
              {completed.length}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">of {totalCourses} done</p>
            {/* Mini progress bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">{pct}% complete</p>
          </div>
        </div>

        {/* Next unlock */}
        {nextCourse && (
          <div className="bg-accent border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-medium text-primary uppercase tracking-wide mb-0.5">Next unlock</p>
              <p className="text-[12px] font-display font-bold text-foreground leading-snug">{nextCourse.title}</p>
            </div>
            <ChevronRight size={14} className="text-primary shrink-0" />
          </div>
        )}

        {!nextCourse && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
            <p className="text-[13px] font-display font-bold text-green-700">Roadmap complete!</p>
            <p className="text-[11px] text-green-600 mt-0.5">You've finished all available courses.</p>
          </div>
        )}

        {/* Completed list */}
        <div>
          <p className="text-[10px] font-mono font-medium tracking-[0.1em] uppercase text-muted-foreground mb-2">
            Completed
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {completedCourseNames.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-muted-foreground text-center">No courses completed yet.</p>
            ) : (
              completedCourseNames.map((name, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${i < completedCourseNames.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-[12px] font-medium text-foreground">{name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profile info */}
        {profile && (
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-[10px] font-mono font-medium uppercase tracking-wide text-muted-foreground mb-2">Your profile</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">Name</span>
                <span className="text-[12px] font-semibold text-foreground">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">State</span>
                <span className="text-[12px] font-semibold text-foreground">{profile.benchmark.stateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">Income band</span>
                <span className="text-[12px] font-semibold text-foreground">{profile.benchmark.incomeLabel.split("/")[0].trim()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onReassess}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-[12px] font-bold hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={13} /> Start Reassessment
          </button>
          <button
            onClick={onClearAll}
            className="w-full flex items-center justify-center gap-2 py-3 bg-card border border-border text-muted-foreground rounded-xl text-[12px] font-medium hover:bg-muted transition-colors"
          >
            <Trash2 size={13} /> Clear All Saved Data
          </button>
        </div>

      </div>

      {/* Bottom nav */}
      <div className="border-t border-border bg-card px-5 pb-5 pt-2.5 shrink-0">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-[10px] font-mono">Profile</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground" onClick={() => onNavigate("dashboard")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span className="text-[10px] font-mono">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="text-[10px] font-mono text-primary">Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}

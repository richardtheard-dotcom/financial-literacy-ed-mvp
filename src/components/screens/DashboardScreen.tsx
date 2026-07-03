import { useState } from "react";
import {
  Star, Lock, BookOpen, Flame, ChevronRight, Zap,
  BarChart2, AlertCircle, TrendingUp, ExternalLink,
} from "lucide-react";
import type { AppState, Course, CourseBuilderConfig, UserProfile } from "../../lib/types";
import { buildNarrative, reasonForCourse } from "../../lib/onboarding";
import { calculateLocalFrontierRoadmap } from "../../lib/engine";
import { generateCustomCourse } from "../../lib/courseGenerator";
import { COURSES, COURSE_PREREQUISITES } from "../../lib/data/courses";

// ── Builder questions (from dashboard.js) ────────────────────────────────────

const BUILDER_QUESTIONS = [
  {
    id: "topic",
    text: "Choose a focus topic:",
    choices: [
      { value: "buffer", label: "The $500 Buffer Engine (Strategic Insulation)" },
      { value: "triage", label: "Bill Triage & Consequence Hierarchies" },
      { value: "overdraft", label: "Deconstructing Checking Account Fees" },
      { value: "predatory", label: "Navigating Alternative Credit & Payday Loans" },
    ],
  },
  {
    id: "depth",
    text: "Target course depth:",
    choices: [
      { value: "express", label: "Express Path (2–3 Lessons)" },
      { value: "comprehensive", label: "Comprehensive Path (4 Lessons)" },
    ],
  },
  {
    id: "format",
    text: "Practice format:",
    choices: [
      { value: "scenarios", label: "Scenario Simulation (Interactive Tasks)" },
      { value: "quizzes", label: "Conceptual Assessments (Quizzes)" },
    ],
  },
  {
    id: "objective",
    text: "Primary objective:",
    choices: [
      { value: "avoid_fees", label: "Protect checking account & avoid immediate fees" },
      { value: "reduce_stress", label: "Prioritize daily safety & reduce financial stress" },
      { value: "break_debt", label: "Break out of payday/predatory debt rollover loops" },
    ],
  },
];

// ── Locked course IDs (those with unmet prerequisites) ──────────────────────

function getLockedIds(completedIds: string[]): Set<string> {
  const locked = new Set<string>();
  for (const prereq of COURSE_PREREQUISITES) {
    if (!completedIds.includes(prereq.requires_prerequisite_id)) {
      locked.add(prereq.course_id);
    }
  }
  return locked;
}

// ── Signal card ──────────────────────────────────────────────────────────────

function SignalPill({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-muted rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xl font-display font-extrabold text-foreground leading-none mb-1">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{note}</p>
    </div>
  );
}

// ── Track card ───────────────────────────────────────────────────────────────

function TrackCard({
  course, index, isCompleted, isLocked, isExpanded, onToggle, onOpen,
}: {
  course: Course; index: number; isCompleted: boolean; isLocked: boolean;
  isExpanded: boolean; onToggle: () => void; onOpen: () => void;
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isLocked
          ? "border-border bg-card/50 opacity-55"
          : isExpanded
          ? "border-primary bg-accent shadow-sm"
          : isCompleted
          ? "border-green-300 bg-green-50"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div
        className={`px-4 py-3.5 ${!isLocked ? "cursor-pointer" : ""}`}
        onClick={() => !isLocked && onToggle()}
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0">
            {isLocked ? (
              <Lock size={13} className="text-muted-foreground" />
            ) : isCompleted ? (
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            ) : (
              <Star
                size={13}
                className={isExpanded ? "text-primary fill-primary" : "text-primary"}
                fill={isExpanded ? "currentColor" : "none"}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className={`text-[10px] font-mono font-medium tracking-wide uppercase ${isExpanded ? "text-primary" : "text-muted-foreground"}`}>
                Track {index + 1}
              </span>
              {!isLocked && course.duration_label && (
                <span className="text-[9px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  {course.duration_label}
                </span>
              )}
              {isCompleted && (
                <span className="text-[9px] font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  Done
                </span>
              )}
            </div>
            <p className={`text-[13px] font-display font-bold leading-tight ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
              {course.title}
            </p>
            {!isLocked && course.reason && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{course.reason}</p>
            )}
            {isLocked && (
              <p className="text-[11px] text-muted-foreground mt-1 italic leading-tight">
                {(() => {
                  const prereq = COURSE_PREREQUISITES.find((p) => p.course_id === course.id);
                  const prereqCourse = prereq
                    ? COURSES.find((c) => c.id === prereq.requires_prerequisite_id)
                    : null;
                  return prereqCourse ? `Unlocks after completing "${prereqCourse.title}"` : "Unlocks after completing prerequisites";
                })()}
              </p>
            )}
          </div>
          {!isLocked && (
            <ChevronRight
              size={13}
              className={`text-muted-foreground transition-transform duration-200 mt-0.5 shrink-0 ${isExpanded ? "rotate-90" : ""}`}
            />
          )}
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors"
            >
              <BookOpen size={11} />
              {isCompleted ? "Revisit Lessons" : "Reveal Lessons"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Course Builder ───────────────────────────────────────────────────────────

function CourseBuilder({ profile, onGenerated }: { profile: UserProfile; onGenerated: (course: Course) => void }) {
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (value: string) => {
    const next = { ...answers, [qIndex]: value };
    setAnswers(next);
    if (qIndex < BUILDER_QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      const config: CourseBuilderConfig = {
        topic: next[0],
        depth: next[1],
        format: next[2],
        objective: next[3],
      };
      const generated = generateCustomCourse(config, profile);
      onGenerated(generated);
    }
  };

  if (!started) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-primary" />
          <h3 className="text-[13px] font-display font-bold text-foreground">Custom Course Builder</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
          Generate a personalized multi-lesson course tuned to your specific goal and situation.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors"
        >
          Start Custom Builder
        </button>
      </div>
    );
  }

  const q = BUILDER_QUESTIONS[qIndex];
  return (
    <div className="bg-card border border-primary rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          <h3 className="text-[13px] font-display font-bold text-foreground">Course Builder</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {qIndex + 1}/{BUILDER_QUESTIONS.length}
        </span>
      </div>
      <p className="text-[12px] font-semibold text-foreground mb-3">{q.text}</p>
      <div className="flex flex-col gap-2">
        {q.choices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => handleAnswer(choice.value)}
            className="w-full text-left px-3 py-2.5 rounded-lg border border-border bg-muted text-[11px] font-medium text-foreground hover:border-primary hover:bg-accent transition-all"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DashboardScreenProps {
  state: AppState;
  onOpenCourse: (courseId: string, generatedCourse?: Course) => void;
  onNavigate: (screen: "progress") => void;
}

export function DashboardScreen({ state, onOpenCourse, onNavigate }: DashboardScreenProps) {
  const { profile, progress } = state;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [builderKey, setBuilderKey] = useState(0);

  if (!profile) return null;

  const completedIds = progress.completedCourses;
  const lockedIds = getLockedIds(completedIds);

  const frontierCourses = calculateLocalFrontierRoadmap(profile, completedIds).map((c) => ({
    ...c,
    reason: reasonForCourse(c.id),
    locked: false,
  }));

  // Also show locked courses (those with unmet prereqs that match profile)
  const allLockedCourses = COURSES.filter(
    (c) =>
      !completedIds.includes(c.id) &&
      !frontierCourses.find((f) => f.id === c.id) &&
      lockedIds.has(c.id)
  ).map((c) => ({ ...c, locked: true, reason: undefined }));

  const displayCourses = [...frontierCourses, ...allLockedCourses].slice(0, 3);

  const handleGeneratedCourse = (course: Course) => {
    setGeneratedCourse(course);
    onOpenCourse(course.id, course);
  };

  const narrative = buildNarrative(profile);

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <span className="font-display text-lg font-extrabold text-foreground tracking-tight">
          Fin<span className="text-primary">Ed</span>
        </span>
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
          <Flame size={12} className="text-orange-500" />
          <span className="text-[11px] font-mono font-medium text-orange-600">
            {progress.streak || 0} Days
          </span>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-5 mb-1.5 shrink-0">
        <h1 className="text-xl font-display font-extrabold text-foreground">
          Welcome, {profile.name.split(" ")[0]}
        </h1>
      </div>

      {/* Context bar */}
      <div className="px-5 mb-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-mono text-muted-foreground truncate">
            {profile.benchmark.stateName} · {profile.benchmark.incomeLabel.split("/")[0].trim()}
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">

        {/* Narrative */}
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <p className="text-[11px] text-foreground leading-relaxed">{narrative}</p>
        </div>

        {/* Signals */}
        <div>
          <p className="text-[10px] font-mono font-medium tracking-[0.1em] uppercase text-muted-foreground mb-2">
            Profile Signals
          </p>
          <div className="grid grid-cols-3 gap-2">
            <SignalPill label="Knowledge" value={`${profile.signals.knowledgeScore}/3`} note="Quiz score" />
            <SignalPill label="Risk" value={`${profile.signals.behaviorScore}/10`} note="Vulnerability" />
            <SignalPill label="Confidence" value={`${profile.signals.confidenceScore}/5`} note="Self-rating" />
          </div>
        </div>

        {/* Roadmap tracks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono font-medium tracking-[0.1em] uppercase text-muted-foreground">
              Your Active Roadmap
            </p>
            <button
              onClick={() => onNavigate("progress")}
              className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
            >
              Progress <ExternalLink size={9} />
            </button>
          </div>

          {displayCourses.length === 0 ? (
            <div className="bg-card border border-border rounded-xl px-4 py-5 text-center">
              <TrendingUp size={20} className="text-primary mx-auto mb-2" />
              <p className="text-[12px] font-display font-bold text-foreground">All roadmap courses done!</p>
              <p className="text-[11px] text-muted-foreground mt-1">Use the builder below for custom content.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayCourses.map((course, i) => (
                <TrackCard
                  key={course.id + i}
                  course={course}
                  index={i}
                  isCompleted={completedIds.includes(course.id)}
                  isLocked={!!course.locked}
                  isExpanded={expandedId === course.id}
                  onToggle={() => setExpandedId(expandedId === course.id ? null : course.id)}
                  onOpen={() => onOpenCourse(course.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Daily briefing */}
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle size={12} className="text-primary" />
            <span className="text-[10px] font-mono font-medium uppercase tracking-wide text-primary">Daily Briefing</span>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed mb-2">
            A small emergency fund and a simple budget can reduce stress when bills or income change.
          </p>
          <a
            href="https://www.federalreserve.gov/consumerscommunities/sheddataviz/unexpectedexpenses-table.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
          >
            Federal Reserve data <ExternalLink size={10} />
          </a>
        </div>

        {/* Course builder */}
        <CourseBuilder
          key={builderKey}
          profile={profile}
          onGenerated={handleGeneratedCourse}
        />

        {/* Benchmark details */}
        <div className="bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={12} className="text-primary" />
            <span className="text-[10px] font-mono font-medium uppercase tracking-wide text-primary">Local Context</span>
          </div>
          <div className="space-y-1">
            {[
              { label: "State", value: profile.benchmark.stateName },
              { label: "Context", value: profile.benchmark.strainLabel },
              { label: "Vulnerability index", value: profile.benchmark.vulnerabilityIndex },
              { label: "Emergency fund rate", value: `${profile.benchmark.emergencyFundRate}%` },
              { label: "Bill strain rate", value: `${profile.benchmark.billStrainRate}%` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-muted-foreground">{row.label}</span>
                <span className="text-[11px] font-semibold text-foreground capitalize">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div className="border-t border-border bg-card px-5 pb-5 pt-2.5 shrink-0">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground" onClick={() => {}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-[10px] font-mono">Profile</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span className="text-[10px] font-mono text-primary">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-muted-foreground" onClick={() => onNavigate("progress")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="text-[10px] font-mono">Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}

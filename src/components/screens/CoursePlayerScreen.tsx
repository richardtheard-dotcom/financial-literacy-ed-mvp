import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from "lucide-react";
import type { AppState, Course, Lesson } from "../../lib/types";
import { getLessonIndex } from "../../lib/state";

// ── Lesson renderers ─────────────────────────────────────────────────────────

function TextBlock({ lesson }: { lesson: Lesson }) {
  const paragraphs = (lesson.body ?? "").split("\n\n");
  return (
    <div>
      {lesson.heading && (
        <h3 className="text-[14px] font-display font-bold text-foreground mb-2 leading-snug">
          {lesson.heading}
        </h3>
      )}
      <div className="space-y-2.5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[12px] text-foreground leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

function BulletFlow({ lesson }: { lesson: Lesson }) {
  return (
    <ul className="space-y-2.5">
      {(lesson.points ?? []).map((pt, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span className="text-[12px] text-foreground leading-relaxed">{pt}</span>
        </li>
      ))}
    </ul>
  );
}

function InteractiveIsolation({
  lesson,
  onReady,
}: {
  lesson: Lesson;
  onReady: (ready: boolean) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleOption = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    setFeedback(null);
  };

  const checkAnswer = () => {
    const options = lesson.options ?? [];
    const allCorrect = options.every(
      (opt) => !!checked[opt.id] === opt.correct
    );
    if (allCorrect) {
      setFeedback("Nice — that's exactly right.");
      onReady(true);
    } else {
      setFeedback("Not quite. Review your selections and try again.");
      onReady(false);
    }
  };

  return (
    <div>
      <p className="text-[12px] text-foreground mb-3 leading-relaxed">{lesson.instruction}</p>
      <div className="space-y-2 mb-3">
        {(lesson.options ?? []).map((opt) => (
          <label
            key={opt.id}
            className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              checked[opt.id] ? "border-primary bg-accent" : "border-border bg-card"
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[opt.id]}
              onChange={() => toggleOption(opt.id)}
              className="mt-0.5 accent-primary"
            />
            <span className="text-[12px] text-foreground leading-snug">{opt.label}</span>
          </label>
        ))}
      </div>
      <button
        onClick={checkAnswer}
        className="px-4 py-2 bg-muted text-foreground rounded-lg text-[11px] font-mono font-medium hover:bg-border transition-colors"
      >
        Check my answer
      </button>
      {feedback && (
        <p className={`mt-2 text-[11px] font-mono font-medium ${feedback.startsWith("Nice") ? "text-green-600" : "text-orange-500"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}

function QuizAssessment({
  lesson,
  onReady,
}: {
  lesson: Lesson;
  onReady: (ready: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);

  const checkAnswer = () => {
    if (picked === null) {
      setFeedback("Pick an answer first.");
      return;
    }
    const isCorrect = picked === lesson.correct_index;
    setCorrect(isCorrect);
    setFeedback(
      isCorrect
        ? `Correct. ${lesson.explanation}`
        : `Not quite. ${lesson.explanation}`
    );
    if (isCorrect) onReady(true);
  };

  return (
    <div>
      <p className="text-[13px] font-semibold text-foreground mb-3 leading-snug">{lesson.question}</p>
      <div className="space-y-2 mb-3">
        {(lesson.choices ?? []).map((choice, i) => (
          <button
            key={i}
            onClick={() => { if (!correct) { setPicked(i); setFeedback(null); } }}
            className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-[12px] transition-all ${
              picked === i && !correct
                ? "border-primary bg-accent text-primary"
                : picked === i && correct
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
      {!correct && (
        <button
          onClick={checkAnswer}
          className="px-4 py-2 bg-muted text-foreground rounded-lg text-[11px] font-mono font-medium hover:bg-border transition-colors"
        >
          Check my answer
        </button>
      )}
      {feedback && (
        <p className={`mt-2 text-[11px] font-mono font-medium leading-relaxed ${correct ? "text-green-600" : "text-orange-500"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}

// ── Lesson body dispatcher ────────────────────────────────────────────────────

function LessonBody({
  lesson,
  onReady,
}: {
  lesson: Lesson;
  onReady: (ready: boolean) => void;
}) {
  useEffect(() => {
    // Text and bullet lessons are immediately completable
    if (lesson.type === "text_block" || lesson.type === "bullet_flow") {
      onReady(true);
    } else {
      onReady(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  if (lesson.type === "text_block") return <TextBlock lesson={lesson} />;
  if (lesson.type === "bullet_flow") return <BulletFlow lesson={lesson} />;
  if (lesson.type === "interactive_isolation") return <InteractiveIsolation lesson={lesson} onReady={onReady} />;
  if (lesson.type === "quiz_assessment") return <QuizAssessment lesson={lesson} onReady={onReady} />;
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

interface CoursePlayerScreenProps {
  course: Course;
  appState: AppState;
  onUpdateLessonIndex: (courseId: string, index: number) => void;
  onCompleteCourse: (courseId: string) => void;
  onBack: () => void;
}

export function CoursePlayerScreen({
  course,
  appState,
  onUpdateLessonIndex,
  onCompleteCourse,
  onBack,
}: CoursePlayerScreenProps) {
  const lessons = course.lessons ?? [];
  const savedIndex = Math.min(getLessonIndex(appState, course.id), Math.max(0, lessons.length - 1));
  const [lessonIndex, setLessonIndex] = useState(savedIndex);
  const [canAdvance, setCanAdvance] = useState(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  const lesson = lessons[lessonIndex];
  const isLast = lessonIndex === lessons.length - 1;
  const progressPct = ((lessonIndex + 1) / lessons.length) * 100;
  const isAlreadyCompleted = appState.progress.completedCourses.includes(course.id);

  const goTo = (idx: number) => {
    setLessonIndex(idx);
    setCanAdvance(false);
    setCompletedMessage(null);
    onUpdateLessonIndex(course.id, idx);
  };

  const handleAdvance = () => {
    if (!isLast) {
      goTo(lessonIndex + 1);
    } else {
      onCompleteCourse(course.id);
      setCompletedMessage(`"${course.title}" marked complete. Your streak has been updated.`);
    }
  };

  if (!lesson) return null;

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <span className="font-display text-sm font-extrabold text-foreground tracking-tight truncate block">
            Fin<span className="text-primary">Ed</span>{" "}
            <span className="font-normal text-muted-foreground">· {course.duration_label ?? course.duration ?? "—"}</span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0">
          {lessonIndex + 1}/{lessons.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-3 shrink-0">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Course title */}
      <div className="px-5 mb-3 shrink-0">
        <h2 className="text-base font-display font-bold text-foreground leading-snug">{course.title}</h2>
      </div>

      {/* Lesson nav pills */}
      <div className="px-5 mb-3 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {lessons.map((les, idx) => (
            <button
              key={les.id}
              onClick={() => goTo(idx)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                idx === lessonIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson content */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="mb-3">
          <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
            Lesson {lessonIndex + 1} of {lessons.length}
          </span>
          <h3 className="text-[13px] font-display font-bold text-foreground mt-2 mb-3 leading-snug">
            {lesson.title}
          </h3>
        </div>
        <LessonBody
          key={lesson.id}
          lesson={lesson}
          onReady={setCanAdvance}
        />
        {completedMessage && (
          <div className="mt-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-[11px] font-mono text-green-700 leading-relaxed">{completedMessage}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-5 pb-6 pt-3 shrink-0">
        <div className="flex gap-2.5">
          <button
            onClick={() => lessonIndex > 0 && goTo(lessonIndex - 1)}
            disabled={lessonIndex === 0}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border text-[12px] font-medium text-muted-foreground bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            onClick={handleAdvance}
            disabled={!canAdvance && !isAlreadyCompleted}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
              isLast
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isLast ? (
              <><Check size={13} /> Complete course</>
            ) : (
              <>Continue <ChevronRight size={13} /></>
            )}
          </button>
        </div>
        <button
          onClick={onBack}
          className="w-full mt-2 text-center text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to dashboard
        </button>
      </div>
    </div>
  );
}

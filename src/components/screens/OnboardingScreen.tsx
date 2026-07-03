import { useState } from "react";
import { ChevronRight, ChevronLeft, Info, RotateCcw, Check } from "lucide-react";
import type { OnboardingFormData, UserProfile, Course } from "../../lib/types";
import { buildProfile, buildRecommendations, validateStep } from "../../lib/onboarding";

const TOTAL_STEPS = 6;

const defaultForm: OnboardingFormData = {
  name: "", email: "",
  q1: "", q2: "", q3: "",
  bills: "", emergencyFund: "", overspending: "", overdrafts: "", borrowing: "",
  incomeBand: "", goal: "", learningStyle: "", confidence: 3,
  state: "", zip: "", household: "", immigration: "", community: "",
};

// ── Shared radio/select component ────────────────────────────────────────────

function RadioGroup({
  label, name, value, onChange, options, sublabel,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  sublabel?: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[13px] font-display font-semibold text-foreground mb-2 leading-snug">{label}</p>
      {sublabel && <p className="text-[11px] font-mono text-muted-foreground mb-2">{sublabel}</p>}
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full text-left rounded-xl border-2 px-3.5 py-2.5 flex items-center gap-2.5 transition-all duration-150 ${
                selected
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-primary" : "border-muted-foreground"}`}>
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
              <span className={`text-[12px] font-medium leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextInput({
  label, id, value, onChange, type = "text", placeholder = "", error,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-[12px] font-mono font-medium text-foreground mb-1">{label}</label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-[13px] bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${
          error ? "border-red-400" : "border-border"
        }`}
      />
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Steps ────────────────────────────────────────────────────────────────────

function Step0({ data, onChange, errors }: { data: OnboardingFormData; onChange: (k: keyof OnboardingFormData, v: string) => void; errors: Record<string, string> }) {
  return (
    <div>
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
        Account
      </span>
      <h2 className="text-base font-display font-bold text-foreground mt-2 mb-4 leading-snug">
        Create your learner profile
      </h2>
      <TextInput label="Your name" id="name" value={data.name} onChange={(v) => onChange("name", v)} placeholder="Jordan Smith" error={errors.name} />
      <TextInput label="Email address" id="email" type="email" value={data.email} onChange={(v) => onChange("email", v)} placeholder="you@example.com" error={errors.email} />
    </div>
  );
}

function Step1({ data, onChange }: { data: OnboardingFormData; onChange: (k: keyof OnboardingFormData, v: string) => void }) {
  const questions = [
    {
      key: "q1" as const,
      label: "What is an emergency fund for?",
      options: [
        { value: "a", label: "Vacation spending" },
        { value: "b", label: "Unexpected expenses" },
        { value: "c", label: "Investing only" },
      ],
    },
    {
      key: "q2" as const,
      label: "Paying only credit card minimums usually...",
      options: [
        { value: "a", label: "Reduces debt fastest" },
        { value: "b", label: "Can increase interest paid" },
        { value: "c", label: "Removes all fees" },
      ],
    },
    {
      key: "q3" as const,
      label: "A budget helps you...",
      options: [
        { value: "a", label: "Track money decisions" },
        { value: "b", label: "Avoid all spending forever" },
        { value: "c", label: "Replace income" },
      ],
    },
  ];
  return (
    <div>
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
        Knowledge Quiz
      </span>
      <h2 className="text-base font-display font-bold text-foreground mt-2 mb-4 leading-snug">
        Three quick financial questions
      </h2>
      {questions.map((q) => (
        <RadioGroup key={q.key} label={q.label} name={q.key} value={data[q.key]} onChange={(v) => onChange(q.key, v)} options={q.options} />
      ))}
    </div>
  );
}

function Step2({ data, onChange }: { data: OnboardingFormData; onChange: (k: keyof OnboardingFormData, v: string) => void }) {
  const fields: Array<{ key: keyof OnboardingFormData; label: string; options: { value: string; label: string }[] }> = [
    {
      key: "overdrafts",
      label: "In the past 12 months, how often did electronic transactions overdraw your checking account?",
      options: [
        { value: "0", label: "Never / Not Applicable" },
        { value: "1", label: "1 to 2 times across the year" },
        { value: "2", label: "3 or more times (Frequent fees)" },
      ],
    },
    {
      key: "bills",
      label: "Do you struggle to pay bills on time?",
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Sometimes" },
        { value: "2", label: "Often" },
      ],
    },
    {
      key: "emergencyFund",
      label: "Do you have a 3-month emergency fund?",
      options: [
        { value: "0", label: "Yes, fully funded" },
        { value: "1", label: "Partially built" },
        { value: "2", label: "No emergency fund" },
      ],
    },
    {
      key: "overspending",
      label: "Do you spend more than planned?",
      options: [
        { value: "0", label: "Rarely" },
        { value: "1", label: "Sometimes" },
        { value: "2", label: "Often" },
      ],
    },
    {
      key: "borrowing",
      label: "Have you used high-cost or predatory borrowing?",
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Maybe / Not sure" },
        { value: "2", label: "Yes" },
      ],
    },
  ];
  return (
    <div>
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
        Habits & Vulnerability
      </span>
      <h2 className="text-base font-display font-bold text-foreground mt-2 mb-4 leading-snug">
        Tell us about your financial habits
      </h2>
      {fields.map((f) => (
        <RadioGroup key={String(f.key)} label={f.label} name={String(f.key)} value={String(data[f.key])} onChange={(v) => onChange(f.key, v)} options={f.options} />
      ))}
    </div>
  );
}

function Step3({ data, onChange }: { data: OnboardingFormData; onChange: (k: keyof OnboardingFormData, v: string | number) => void }) {
  return (
    <div>
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
        Goals & Preferences
      </span>
      <h2 className="text-base font-display font-bold text-foreground mt-2 mb-4 leading-snug">
        What describes your situation?
      </h2>
      <RadioGroup
        label="Income band"
        name="incomeBand"
        value={data.incomeBand}
        onChange={(v) => onChange("incomeBand", v)}
        options={[
          { value: "under35000", label: "Under $35,000 / year" },
          { value: "middle", label: "$35,000 to $99,999 / year" },
          { value: "100000plus", label: "$100,000+ / year" },
        ]}
      />
      <RadioGroup
        label="Primary financial goal"
        name="goal"
        value={data.goal}
        onChange={(v) => onChange("goal", v)}
        options={[
          { value: "emergency-fund", label: "Build emergency fund" },
          { value: "budgeting", label: "Get control of monthly spending" },
          { value: "debt", label: "Pay down debt" },
          { value: "savings", label: "Save for a goal" },
        ]}
      />
      <RadioGroup
        label="Preferred learning style"
        name="learningStyle"
        value={data.learningStyle}
        onChange={(v) => onChange("learningStyle", v)}
        options={[
          { value: "short", label: "Short lessons (2–3 min each)" },
          { value: "visual", label: "Visual examples" },
          { value: "guided", label: "Step-by-step guided" },
        ]}
      />
      <div className="mb-3">
        <p className="text-[12px] font-mono font-medium text-foreground mb-1">
          Money confidence: {data.confidence}/5
        </p>
        <p className="text-[11px] text-muted-foreground mb-2">1 = not confident, 5 = very confident</p>
        <input
          type="range" min={1} max={5} value={data.confidence}
          onChange={(e) => onChange("confidence", Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}

function Step4({ data, onChange, errors }: { data: OnboardingFormData; onChange: (k: keyof OnboardingFormData, v: string) => void; errors: Record<string, string> }) {
  return (
    <div>
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
        Location & Context
      </span>
      <h2 className="text-base font-display font-bold text-foreground mt-2 mb-4 leading-snug">
        Local context improves your roadmap
      </h2>
      <TextInput label="State (2-letter code)" id="state" value={data.state} onChange={(v) => onChange("state", v)} placeholder="NY" error={errors.state} />
      <TextInput label="ZIP code (optional)" id="zip" value={data.zip} onChange={(v) => onChange("zip", v)} placeholder="10001" />
      <RadioGroup
        label="Household type (optional)"
        name="household"
        value={data.household}
        onChange={(v) => onChange("household", v)}
        options={[
          { value: "", label: "Prefer not to say" },
          { value: "single", label: "Single adult" },
          { value: "family", label: "Family" },
          { value: "student", label: "Student" },
          { value: "other", label: "Other" },
        ]}
      />
      <RadioGroup
        label="Immigration context (optional)"
        name="immigration"
        value={data.immigration}
        onChange={(v) => onChange("immigration", v)}
        options={[
          { value: "", label: "Prefer not to say" },
          { value: "new-immigrant-family", label: "New immigrant family" },
          { value: "mixed-status", label: "Mixed-status household" },
          { value: "none", label: "Not applicable" },
        ]}
      />
    </div>
  );
}

function Step5({ data }: { data: OnboardingFormData }) {
  const profile = buildProfile(data);
  const items = [
    { label: "Name", value: profile.name || "—" },
    { label: "Email", value: profile.email || "—" },
    { label: "Income band", value: profile.benchmark.incomeLabel },
    { label: "Primary goal", value: profile.goal.replace(/-/g, " ") || "—" },
    { label: "State", value: profile.benchmark.stateName },
    { label: "Knowledge score", value: `${profile.signals.knowledgeScore}/3` },
    { label: "Vulnerability score", value: `${profile.signals.behaviorScore}/10` },
    { label: "Confidence", value: `${profile.signals.confidenceScore}/5` },
  ];
  return (
    <div>
      <span className="text-[10px] font-mono font-medium tracking-[0.12em] uppercase text-primary bg-accent px-2 py-0.5 rounded">
        Review
      </span>
      <h2 className="text-base font-display font-bold text-foreground mt-2 mb-4 leading-snug">
        Confirm your profile
      </h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-3">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-3.5 py-2 ${i < items.length - 1 ? "border-b border-border" : ""}`}>
            <span className="text-[11px] font-mono text-muted-foreground">{item.label}</span>
            <span className="text-[12px] font-semibold text-foreground capitalize">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 px-1">
        <Info size={11} className="text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-tight">
          Responses are saved locally and encrypted on this device. Sensitive fields are optional.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile, recommendations: Course[]) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onChange = (key: keyof OnboardingFormData, value: string | number) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleReset = () => {
    setData(defaultForm);
    setErrors({});
    setStep(0);
  };

  const handleSubmit = () => {
    const allErrors = { ...validateStep(0, data), ...validateStep(4, data) };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStep(0);
      return;
    }
    const profile = buildProfile(data);
    const recommendations = buildRecommendations(profile);
    onComplete(profile, recommendations);
  };

  const isLast = step === TOTAL_STEPS - 1;
  const progressPct = ((step) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <span className="font-display text-lg font-extrabold text-foreground tracking-tight">
          Fin<span className="text-primary">Ed</span>
        </span>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          Step {step + 1}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-4 shrink-0">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 pb-2">
        {step === 0 && <Step0 data={data} onChange={onChange} errors={errors} />}
        {step === 1 && <Step1 data={data} onChange={onChange} />}
        {step === 2 && <Step2 data={data} onChange={onChange} />}
        {step === 3 && <Step3 data={data} onChange={onChange} />}
        {step === 4 && <Step4 data={data} onChange={onChange} errors={errors} />}
        {step === 5 && <Step5 data={data} />}
      </div>

      {/* Navigation */}
      <div className="px-5 pb-6 pt-3 shrink-0">
        <div className="flex gap-2.5">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border text-[12px] font-medium text-muted-foreground bg-card hover:bg-muted transition-colors"
            >
              <ChevronLeft size={13} /> Back
            </button>
          )}
          {step === 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border text-[12px] font-medium text-muted-foreground bg-card hover:bg-muted transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          {!isLast ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Continue <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Check size={13} /> Create profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

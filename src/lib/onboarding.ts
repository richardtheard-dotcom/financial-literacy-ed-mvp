import type { Course, OnboardingFormData, UserProfile } from "./types";
import { getBenchmark, getStateMeta } from "./data/benchmarks";
import { calculateLocalFrontierRoadmap } from "./engine";

// ── Scoring ──────────────────────────────────────────────────────────────────

export function scoreQuiz(data: OnboardingFormData): number {
  const answers: Record<string, string> = { q1: "b", q2: "b", q3: "a" };
  let score = 0;
  for (const [id, correct] of Object.entries(answers)) {
    if (data[id as keyof OnboardingFormData] === correct) score += 1;
  }
  return score;
}

export function scoreBehavior(data: OnboardingFormData): number {
  return (
    Number(data.bills || 0) +
    Number(data.emergencyFund || 0) +
    Number(data.overspending || 0) +
    Number(data.overdrafts || 0) +
    Number(data.borrowing || 0)
  );
}

export function scoreVulnerabilityTags(data: OnboardingFormData): string[] {
  const bills = Number(data.bills || 0);
  const emergencyFund = Number(data.emergencyFund || 0);
  const overspending = Number(data.overspending || 0);
  const overdrafts = Number(data.overdrafts || 0);
  const borrowing = Number(data.borrowing || 0);

  const tags: string[] = [];
  if (bills >= 1) tags.push("bills");
  if (emergencyFund >= 1) tags.push("emergency_fund");
  if (overdrafts >= 1) tags.push("overdraft");
  if (borrowing >= 1) tags.push("alternative_borrowing");
  if (
    overspending >= 2 ||
    bills + emergencyFund + overspending + overdrafts + borrowing >= 6
  ) {
    tags.push("financial_stress");
  }
  return tags;
}

export function mapIncomeBandV2(incomeBand: string): string {
  if (incomeBand === "under35000") return "under_35k";
  if (incomeBand === "middle") return "35k_75k";
  return "all";
}

// ── Profile builder ──────────────────────────────────────────────────────────

export function buildProfile(data: OnboardingFormData): UserProfile {
  const incomeBand = data.incomeBand;
  const state = data.state.trim().toUpperCase();
  const benchmark = getBenchmark(incomeBand);
  const stateMeta = getStateMeta(state);

  const knowledgeScore = scoreQuiz(data);
  const behaviorScore = scoreBehavior(data);
  const confidenceScore = Number(data.confidence);

  return {
    name: data.name.trim(),
    email: data.email.trim(),
    incomeBand,
    goal: data.goal,
    learningStyle: data.learningStyle,
    state,
    zip: data.zip.trim(),
    household: data.household,
    immigration: data.immigration,
    community: data.community.trim(),
    signals: { knowledgeScore, behaviorScore, confidenceScore },
    incomeBandV2: mapIncomeBandV2(incomeBand),
    vulnerabilityTags: scoreVulnerabilityTags(data),
    benchmark: {
      incomeLabel: benchmark.label,
      vulnerabilityIndex: benchmark.vulnerabilityIndex,
      emergencyFundRate: benchmark.emergencyFundRate,
      billStrainRate: benchmark.billStrainRate,
      stateName: stateMeta.stateName,
      strainLabel: stateMeta.strainLabel,
    },
  };
}

// ── Recommendation builder ───────────────────────────────────────────────────

export function reasonForCourse(courseId: string): string {
  const reasons: Record<string, string> = {
    course_500_buffer: "A starter buffer helps avoid predatory loans when shortfalls occur.",
    course_bill_triage: "Learn to prioritize essential living needs when cash is tight.",
    course_overdraft_defense: "Protects your checking account from repeating overdraft penalty fees.",
    course_predatory_debt: "Provides strategies for navigating short-term cash advances.",
  };
  return reasons[courseId] ?? "A good match for your current financial goals.";
}

export function buildRecommendations(profile: UserProfile): Course[] {
  const recs = calculateLocalFrontierRoadmap(profile, []);
  return recs.map((course) => ({
    ...course,
    reason: reasonForCourse(course.id),
    locked: false,
  }));
}

// ── Validation ───────────────────────────────────────────────────────────────

export interface ValidationErrors {
  name?: string;
  email?: string;
  state?: string;
}

export function validateStep(
  step: number,
  data: OnboardingFormData
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (step === 0) {
    if (!data.name.trim()) errors.name = "Name is required.";
    if (!data.email.trim() || !data.email.includes("@"))
      errors.email = "Please enter a valid email.";
  }
  if (step === 4) {
    if (!/^[A-Z]{2}$/.test(data.state.trim().toUpperCase()))
      errors.state = "Enter a valid 2-letter state code (e.g. NY).";
  }
  return errors;
}

// ── Dashboard narrative ──────────────────────────────────────────────────────

function scoreToLabel(score: number): string {
  if (score <= 2) return "Low";
  if (score <= 5) return "Moderate";
  return "High";
}

export function buildNarrative(profile: UserProfile): string {
  const riskLabel = scoreToLabel(profile.signals.behaviorScore);
  const knowledgeLabel = scoreToLabel(3 - profile.signals.knowledgeScore);
  return `${profile.name}, your starting point suggests ${riskLabel.toLowerCase()} financial vulnerability and ${knowledgeLabel.toLowerCase()} knowledge confidence. Your roadmap is tuned to ${profile.benchmark.incomeLabel} households in ${profile.benchmark.stateName}.`;
}

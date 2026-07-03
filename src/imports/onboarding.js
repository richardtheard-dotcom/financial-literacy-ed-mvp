let currentStep = 0;

function showStep(step) {
  document.querySelectorAll(".form-step").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.step) === step);
  });
  document.querySelectorAll(".step").forEach((el, index) => {
    el.classList.toggle("active", index === step);
  });

  document.getElementById("backBtn").disabled = step === 0;
  document.getElementById("nextBtn").classList.toggle("hidden", step === 5);
  document.getElementById("submitBtn").classList.toggle("hidden", step !== 5);
  if (step === 5) renderReview();
}

function setError(id, message) {
  const el = document.getElementById(`${id}Error`);
  if (el) el.textContent = message || "";
}

function validateStep(step) {
  let valid = true;
  if (step === 0) {
    ["name", "email"].forEach((id) => setError(id, ""));
    if (!document.getElementById("name").value.trim()) {
      setError("name", "Name is required.");
      valid = false;
    }
    const email = document.getElementById("email").value.trim();
    if (!email || !email.includes("@")) {
      setError("email", "Please enter a valid email.");
      valid = false;
    }
  }
  if (step === 4) {
    const state = document.getElementById("state").value.trim().toUpperCase();
    setError("state", "");
    if (!/^[A-Z]{2}$/.test(state)) {
      setError("state", "Enter a valid 2-letter state code.");
      valid = false;
    }
  }
  return valid;
}

function scoreQuiz() {
  const answers = { q1: "b", q2: "b", q3: "a" };
  let score = 0;
  Object.entries(answers).forEach(([id, correct]) => {
    if (document.getElementById(id).value === correct) score += 1;
  });
  return score;
}

function scoreBehavior() {
  return ["bills", "emergencyFund", "overspending", "overdrafts", "borrowing"]
    .map((id) => Number(document.getElementById(id).value || 0))
    .reduce((a, b) => a + b, 0);
}

// ── NEW: converts the same 5 habit answers into the tag array COURSES_V2 /
// engine.js expect. Runs alongside scoreBehavior(), doesn't replace it.
function scoreVulnerabilityTags() {
  const bills = Number(document.getElementById("bills").value || 0);
  const emergencyFund = Number(document.getElementById("emergencyFund").value || 0);
  const overspending = Number(document.getElementById("overspending").value || 0);
  const overdrafts = Number(document.getElementById("overdrafts").value || 0);
  const borrowing = Number(document.getElementById("borrowing").value || 0);

  const tags = [];
  if (bills >= 1) tags.push("bills");
  if (emergencyFund >= 1) tags.push("emergency_fund");
  if (overdrafts >= 1) tags.push("overdraft");
  if (borrowing >= 1) tags.push("alternative_borrowing");
  // financial_stress is the "overall strain" tag: trips if spending is
  // consistently off-plan OR if the total behavior score is high.
  if (overspending >= 2 || bills + emergencyFund + overspending + overdrafts + borrowing >= 6) {
    tags.push("financial_stress");
  }
  return tags;
}

// ── NEW: maps this app's income band IDs to the PRD/COURSES_V2 IDs.
// 100000plus has no dedicated PRD band, so it only matches "all"-tagged
// courses, which is the PRD's intended behavior for higher earners.
function mapIncomeBandV2(incomeBand) {
  if (incomeBand === "under35000") return "under_35k";
  if (incomeBand === "middle") return "35k_75k";
  return "all";
}

function getProfile() {
  const incomeBand = document.getElementById("incomeBand").value;
  const state = document.getElementById("state").value.trim().toUpperCase();
  const benchmark = BENCHMARKS[incomeBand] || BENCHMARKS.middle;
  const stateMeta = BENCHMARKS.states[state] || { stateName: state || "Unknown", strainLabel: "unmapped context" };

  const knowledgeScore = scoreQuiz();
  const behaviorScore = scoreBehavior();
  const confidenceScore = Number(document.getElementById("confidence").value);

  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    incomeBand,
    goal: document.getElementById("goal").value,
    learningStyle: document.getElementById("learningStyle").value,
    state,
    zip: document.getElementById("zip").value.trim(),
    household: document.getElementById("household").value,
    immigration: document.getElementById("immigration").value,
    community: document.getElementById("community").value.trim(),
    signals: {
      knowledgeScore,
      behaviorScore,
      confidenceScore
    },
    // NEW: parallel fields for the Phase 2C engine. Existing dashboard.js
    // code never reads these, so nothing currently working changes.
    incomeBandV2: mapIncomeBandV2(incomeBand),
    vulnerabilityTags: scoreVulnerabilityTags(),
    benchmark: {
      incomeLabel: benchmark.label,
      vulnerabilityIndex: benchmark.vulnerabilityIndex,
      emergencyFundRate: benchmark.emergencyFundRate,
      billStrainRate: benchmark.billStrainRate,
      stateName: stateMeta.stateName,
      strainLabel: stateMeta.strainLabel
    }
  };
}

function buildRecommendations(profile) {
  if (typeof calculateLocalFrontierRoadmap !== "undefined") {
    const recommendations = calculateLocalFrontierRoadmap(profile, []);
    return recommendations.map((course) => ({
      ...course,
      reason: reasonForCourse(course, profile),
      locked: false
    }));
  }
  return [];
}

function reasonForCourse(course, profile) {
  if (course.id === "course_500_buffer") return "A starter buffer helps avoid predatory loans when shortfalls occur.";
  if (course.id === "course_bill_triage") return "Learn to prioritize essential living needs when cash is tight.";
  if (course.id === "course_overdraft_defense") return "Protects your checking account from repeating overdraft penalty fees.";
  if (course.id === "course_predatory_debt") return "Provides strategies for navigating short-term cash advances.";
  return "A good match for your current financial goals.";
}

function renderReview() {
  const profile = getProfile();
  document.getElementById("reviewBox").innerHTML = `
    <strong>${profile.name}</strong><br>
    Email: ${profile.email}<br>
    Income band: ${profile.benchmark.incomeLabel}<br>
    Goal: ${profile.goal}<br>
    State: ${profile.benchmark.stateName}<br>
    Knowledge score: ${profile.signals.knowledgeScore}/3<br>
    Vulnerability score: ${profile.signals.behaviorScore}/10<br>
    Confidence: ${profile.signals.confidenceScore}/5
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("onboardingForm");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const resetBtn = document.getElementById("resetBtn");
  const submitBtn = document.getElementById("submitBtn");
  const message = document.getElementById("formMessage");

  showStep(currentStep);

  nextBtn.addEventListener("click", () => {
    if (!validateStep(currentStep)) {
      message.textContent = "Please fix the highlighted fields.";
      return;
    }
    message.textContent = "";
    currentStep = Math.min(currentStep + 1, 5);
    showStep(currentStep);
  });

  backBtn.addEventListener("click", () => {
    message.textContent = "";
    currentStep = Math.max(currentStep - 1, 0);
    showStep(currentStep);
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    message.textContent = "Form reset. Start again whenever you are ready.";
    currentStep = 0;
    showStep(currentStep);
    ["nameError", "emailError", "stateError"].forEach((id) => (document.getElementById(id).textContent = ""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(0) || !validateStep(4)) {
      message.textContent = "Please correct the highlighted fields before submitting.";
      return;
    }

    const profile = getProfile();
    const recommendations = buildRecommendations(profile);
    const state = updateState((appState) => {
      appState.profile = profile;
      appState.recommendations = recommendations;
      appState.progress.reassessmentCount = appState.progress.reassessmentCount || 0;
    });

    saveState(state);
    window.location.href = "dashboard.html";
  });
});

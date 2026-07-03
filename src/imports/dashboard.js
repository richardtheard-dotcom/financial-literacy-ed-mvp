function scoreToLabel(score) {
  if (score <= 2) return "Low";
  if (score <= 5) return "Moderate";
  return "High";
}

function buildNarrative(profile) {
  const riskLabel = scoreToLabel(profile.signals.behaviorScore);
  const knowledgeLabel = scoreToLabel(3 - profile.signals.knowledgeScore);
  return `${profile.name}, your starting point suggests ${riskLabel.toLowerCase()} financial vulnerability and ${knowledgeLabel.toLowerCase()} knowledge confidence. Your roadmap is tuned to ${profile.benchmark.incomeLabel} households and ${profile.benchmark.stateName} context.`;
}

function renderSignals(profile) {
  const items = [
    { title: "Knowledge", value: `${profile.signals.knowledgeScore}/3`, note: "How well you answered the quiz." },
    { title: "Vulnerability", value: `${profile.signals.behaviorScore}/10`, note: "Bills, emergency fund, spending, overdrafts, borrowing." },
    { title: "Confidence", value: `${profile.signals.confidenceScore}/5`, note: "How ready you feel to learn." }
  ];
  document.getElementById("signalCards").innerHTML = items.map(item => `
    <div class="signal-card">
      <h4>${item.title}</h4>
      <p class="big-number">${item.value}</p>
      <p class="muted">${item.note}</p>
    </div>
  `).join("");
}

function reasonForCourse(course, profile) {
  if (course.id === "course_500_buffer") return "A starter buffer helps avoid predatory loans when shortfalls occur.";
  if (course.id === "course_bill_triage") return "Learn to prioritize essential living needs when cash is tight.";
  if (course.id === "course_overdraft_defense") return "Protects your checking account from repeating overdraft penalty fees.";
  if (course.id === "course_predatory_debt") return "Provides strategies for navigating short-term cash advances.";
  return "A good match for your current financial goals.";
}

function renderRecommendations(recommendations) {
  document.getElementById("courseList").innerHTML = recommendations.map(course => {
    const duration = course.duration_label || course.duration || "";
    const tag = course.behaviorTag || (course.vulnerability_focus ? course.vulnerability_focus.join(", ") : "");
    return `
      <article class="course-card ${course.locked ? "locked" : ""}">
        <h4>${course.title}</h4>
        <p class="muted">${course.description}</p>
        <p><strong>${duration}</strong></p>
        <p>${course.reason}</p>
        <a href="course.html?id=${encodeURIComponent(course.id)}">Open course</a>
        <div class="tag">${tag}</div>
      </article>
    `;
  }).join("");
}

function renderBriefing() {
  const briefing = {
    headline: "Daily briefing",
    summary: "A small emergency fund and a simple budget can reduce stress when bills or income change.",
    link: "https://www.federalreserve.gov/consumerscommunities/sheddataviz/unexpectedexpenses-table.html"
  };
  document.getElementById("dailyBriefing").innerHTML = `
    <strong>${briefing.headline}</strong>
    <p>${briefing.summary}</p>
    <a href="${briefing.link}" target="_blank" rel="noopener noreferrer">Read more</a>
  `;
}

// ── SEQUENTIAL QUESTION ENGINE ─────────────────────────────────────────────

const questions = [
  {
    id: "topic",
    text: "1. Choose Focus Topic:",
    choices: [
      { value: "buffer", label: "The $500 Buffer Engine (Strategic Insulation)" },
      { value: "triage", label: "Bill Triage & Consequence Hierarchies" },
      { value: "overdraft", label: "Deconstructing Checking Account Fees" },
      { value: "predatory", label: "Navigating Alternative Credit & Payday Loans" }
    ]
  },
  {
    id: "depth",
    text: "2. Target Course Depth:",
    choices: [
      { value: "express", label: "Express Path (2 Lessons)" },
      { value: "comprehensive", label: "Comprehensive Path (4 Lessons)" }
    ]
  },
  {
    id: "format",
    text: "3. Practice Format:",
    choices: [
      { value: "scenarios", label: "Scenario Simulation (Interactive Tasks)" },
      { value: "quizzes", label: "Conceptual Assessments (Quizzes)" }
    ]
  },
  {
    id: "objective",
    text: "4. Primary Objective:",
    choices: [
      { value: "avoid_fees", label: "Protect checking account & avoid immediate fees" },
      { value: "reduce_stress", label: "Prioritize daily safety & reduce financial stress" },
      { value: "break_debt", label: "Break out of payday/predatory debt rollover loops" }
    ]
  }
];

let courseSession = {
  id: "course_500_buffer",
  answers: {},
  currentQuestionIndex: 0
};

function askQuestion() {
  const q = questions[courseSession.currentQuestionIndex];
  renderQuestion(q);
}

function renderQuestion(q) {
  const container = document.getElementById("questionContainer");
  if (!container) return;

  const choicesHtml = q.choices.map(choice => `
    <button type="button" class="secondary choice-btn" data-value="${choice.value}" style="width: 100%; text-align: left; justify-content: flex-start; padding: 14px;">
      ${choice.label}
    </button>
  `).join("");

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <h4 style="margin: 0; font-size: 1.1rem; color: var(--text);">${q.text}</h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${choicesHtml}
      </div>
      <p class="muted" style="margin: 0; font-size: 0.85rem;">Question ${courseSession.currentQuestionIndex + 1} of ${questions.length}</p>
    </div>
  `;

  // Attach click listeners to all choice buttons
  container.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      submitAnswer(btn.dataset.value);
    });
  });
}

function submitAnswer(answer) {
  courseSession.answers[courseSession.currentQuestionIndex] = answer;
  courseSession.currentQuestionIndex++;

  if (courseSession.currentQuestionIndex < questions.length) {
    askQuestion();
  } else {
    generateCourse();
  }
}

// ── COURSE GENERATION (IN MEMORY) ──────────────────────────────
function generateCustomCourse(config, profile) {
  const topicId = config.topic;
  const isExpress = config.depth === "express";
  const practiceType = config.format;
  
  let title = "";
  let baseDescription = "";
  let lessons = [];
  let objectives = [];
  
  if (topicId === "buffer") {
    title = "Personalized $500 Buffer Blueprint";
    baseDescription = `A tailored roadmap for ${profile.name} to establish a $500 safety cushion, avoiding high-cost borrowing.`;
    objectives = [
      "Define non-essential outflow rules",
      "Isolate flexible daily spending lines",
      "Execute safe micro-allocations"
    ];
    
    lessons.push({
      id: "gen_les_1",
      sort_order: 1,
      title: "Strategic Insulation Over Growth",
      type: "text_block",
      heading: "Breaking Payday Borrowing Chains",
      body: "An emergency reserve is not an investment portfolio—it is a defensive shield. Studies show that having just $500 set aside eliminates more than half of the cash shortfalls that lead to predatory payday rollover loans. By focusing on reaching this target first, you construct a resilient barrier against unexpected emergencies."
    });
    
    if (practiceType === "scenarios") {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Isolating Flexible Outflows",
        type: "interactive_isolation",
        instruction: "Identify the optional budget outlays that can be paused immediately to speed up saving your buffer:",
        options: [
          { id: "opt_g_1", label: "Automatic streaming services and subscription trials", correct: true },
          { id: "opt_g_2", label: "Utility base charges and local service connection fees", correct: false },
          { id: "opt_g_3", label: "Buying convenience foods and out-of-network ATM transactions", correct: true },
          { id: "opt_g_4", label: "Mandatory rental and lease contract commitments", correct: false }
        ]
      });
    } else {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Operational Micro-Insulation Rules",
        type: "bullet_flow",
        points: [
          "Separate fixed contracts from variable outflows that can be paused.",
          "Redirect small cash windfalls directly into your reserve account.",
          "Keep the buffer separate from daily transaction accounts to prevent passive spending."
        ]
      });
    }
    
    if (!isExpress) {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Establishing the Micro-Reserve Account",
        type: "text_block",
        heading: "Keeping Your Buffer Safe and Separate",
        body: "To protect your buffer from accidental daily spending, open a secondary, fee-free account. This keeps your defensive funds visually and logistically isolated. Make small, recurring transfers to this account right when you get paid, treating the buffer like an essential bill you owe to yourself."
      });
      lessons.push({
        id: "gen_les_4",
        sort_order: 4,
        title: "Assessing Buffer Resilience",
        type: "quiz_assessment",
        question: "What is the primary action to take once your $500 buffer is fully funded?",
        choices: [
          "Use the funds immediately to make a long-term speculative investment.",
          "Keep it locked in place to handle unexpected household emergencies and bills.",
          "Combine it back into your primary checkings account for daily usage."
        ],
        correct_index: 1,
        explanation: "Keeping your buffer separated and dedicated solely to emergencies ensures it remains available to absorb financial shocks and prevent high-interest borrowing."
      });
    } else {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Buffer Success Check",
        type: "quiz_assessment",
        question: "Why is a $500 target more effective than standard 3-month savings goals for cash-strained households?",
        choices: [
          "It yields higher monthly dividends and interest returns.",
          "It is achievable in the short term, breaking planning paralysis and stopping predatory borrowing cycles.",
          "It instantly wipes out historical credit rating mistakes."
        ],
        correct_index: 1,
        explanation: "A small, realistic goal builds momentum and creates immediate defense against common shocks, while large goals can feel impossible and cause planning paralysis."
      });
    }
    
  } else if (topicId === "triage") {
    title = "Consequence-Based Triage Planner";
    baseDescription = `Learn to prioritize essential living needs when funds are limited. Configured for ${profile.name}.`;
    objectives = [
      "Categorize bills by safety impact",
      "Understand utility grace periods",
      "Draft payment postponement requests"
    ];
    
    lessons.push({
      id: "gen_les_1",
      sort_order: 1,
      title: "The Four-Tier Consequence Framework",
      type: "text_block",
      heading: "Rank by Disruption Risk, Not Due Date",
      body: "When cash flow is tight, do not pay bills based on who calls you the most. Group expenses by the physical consequence of missing them:\n\nTier 1: Sustenance & Shelter (housing, groceries, water, power).\nTier 2: Job Continuity (work transit, primary cell line).\nTier 3: Secured Assets (auto loans if vehicle is needed for work).\nTier 4: Unsecured Accounts (credit cards, streaming services, store cards)."
    });
    
    if (practiceType === "scenarios") {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Sorting Urgent Obligations",
        type: "interactive_isolation",
        instruction: "Select the Tier 4 unsecured accounts that can be delayed to protect Tier 1 housing and utility needs:",
        options: [
          { id: "opt_t_1", label: "Credit card minimum payments", correct: true },
          { id: "opt_t_2", label: "Landlord rent/mortgage balance", correct: false },
          { id: "opt_t_3", label: "Online retail credit lines", correct: true },
          { id: "opt_t_4", label: "Basic household electricity supply", correct: false }
        ]
      });
    } else {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Triage Rules of Thumb",
        type: "bullet_flow",
        points: [
          "Always secure food, shelter, and basic health needs first.",
          "Unsecured creditors cannot report late payment to credit bureaus until 30 days past due.",
          "Call utility providers early to arrange a deferred payment schedule."
        ]
      });
    }
    
    if (!isExpress) {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Leveraging Regulatory Windows",
        type: "text_block",
        heading: "Statutory Protections for Households",
        body: "Most states prevent utility shutoffs during extreme weather or require a formal 15-to-30 day warning period. Unsecured credit card companies cannot mark you late on your credit report until a payment is a full 30 days past the due date. Knowing these timelines gives you breathing room to coordinate your incoming funds."
      });
      lessons.push({
        id: "gen_les_4",
        sort_order: 4,
        title: "Triage Assessment",
        type: "quiz_assessment",
        question: "When facing a major income shortfall, which of the following is the best strategy?",
        choices: [
          "Pay unsecured credit card bills first to keep debt collectors quiet.",
          "Arrange partial payments on Tier 1 utilities and contact creditors before default.",
          "Avoid answering calls and stop monitoring account statements completely."
        ],
        correct_index: 1,
        explanation: "Proactive communication and focusing resources on protecting shelter and utilities keeps your household safe while you restore cash flow."
      });
    } else {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Triage Quick Quiz",
        type: "quiz_assessment",
        question: "How long must an unsecured payment be past due before it can legally be reported to credit bureaus?",
        choices: [
          "Exactly 1 day past due.",
          "At least 30 days past due.",
          "At least 90 days past due."
        ],
        correct_index: 1,
        explanation: "Federal credit reporting rules prevent creditors from reporting a payment late to credit bureaus until it is a full 30 days past the statement due date."
      });
    }
    
  } else if (topicId === "overdraft") {
    title = "Checking Account Overdraft Defense";
    baseDescription = `Protect your banking transactions and avoid $35 overdraft fees. Designed for ${profile.name}.`;
    objectives = [
      "Differentiate Ledger vs. Available balances",
      "Disable automatic overdraft clearing programs",
      "Configure backup account sweep rules"
    ];
    
    lessons.push({
      id: "gen_les_1",
      sort_order: 1,
      title: "Ledger Balance vs. Available Balance",
      type: "text_block",
      heading: "The Source of Surprise Fees",
      body: "Your ledger balance shows only processed transactions from previous business days. Your available balance updates in real-time, accounting for pending purchases, temporary debit holds, and checks that haven't cleared. If you make purchases based on the ledger balance, you run a high risk of overdrafting when pending transactions clear."
    });
    
    if (practiceType === "scenarios") {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Evaluating Safe Transactions",
        type: "interactive_isolation",
        instruction: "Select the events that decrease your available balance immediately before they are processed by the bank:",
        options: [
          { id: "opt_o_1", label: "Temporary merchant holds at fuel stations", correct: true },
          { id: "opt_o_2", label: "Outstanding paper checks you recently wrote", correct: true },
          { id: "opt_o_3", label: "Pending digital transfers initiated online", correct: true },
          { id: "opt_o_4", label: "Scheduled direct deposits arriving next week", correct: false }
        ]
      });
    } else {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Account Setup Recommendations",
        type: "bullet_flow",
        points: [
          "Check your available balance, not ledger, before any transaction.",
          "Contact your bank to OPT OUT of automated debit card overdraft coverage.",
          "Set up automatic low-balance text alerts in your banking app."
        ]
      });
    }
    
    if (!isExpress) {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Opting Out of Overdraft Programs",
        type: "text_block",
        heading: "The Power of a Simple Decline",
        body: "Under federal law, banks cannot charge you overdraft fees on debit card transactions unless you opt in. If you opt out, a transaction that exceeds your available balance is simply declined at the register for free. Opting out prevents expensive cascades of $35 overdraft fees."
      });
      lessons.push({
        id: "gen_les_4",
        sort_order: 4,
        title: "Overdraft Verification Quiz",
        type: "quiz_assessment",
        question: "What happens if you opt out of your bank's automated overdraft clearing program?",
        choices: [
          "The bank will immediately freeze your checking account.",
          "Transactions that exceed your balance are declined at the register, costing $0.",
          "The bank automatically takes out a payday loan to cover the charge."
        ],
        correct_index: 1,
        explanation: "Opting out replaces expensive overdraft penalty fees with a standard decline, protecting your remaining funds from fees."
      });
    } else {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Overdraft Defense Assessment",
        type: "quiz_assessment",
        question: "Which balance represents the actual amount of funds you can spend right now?",
        choices: [
          "Ledger Balance.",
          "Available Balance.",
          "Statement Ending Balance."
        ],
        correct_index: 1,
        explanation: "The Available Balance contains pending authorizations and holds, giving you the real, safe spendable limit."
      });
    }
    
  } else if (topicId === "predatory") {
    title = "Predatory Debt Navigation & Exit Blueprint";
    baseDescription = `Strategies to avoid and exit high-cost payday loans. Tailored for ${profile.name}.`;
    objectives = [
      "Calculate actual APR on short-term advances",
      "Request Extended Payment Plans (EPPs) under state law",
      "Utilize credit union PALs as safe alternatives"
    ];
    
    lessons.push({
      id: "gen_les_1",
      sort_order: 1,
      title: "The True Cost of Short-Term Advances",
      type: "text_block",
      heading: "Decoding the APR Illusion",
      body: "Lenders present charges as a small fee (e.g. '$15 per $100'). However, since these loans must be repaid in a few weeks, that simple fee translates to a massive 300% to 500% APR. Understanding the annual percentage rate (APR) reveals the true cost of borrowing and helps you compare alternatives."
    });
    
    if (practiceType === "scenarios") {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Selecting Low-Cost Alternatives",
        type: "interactive_isolation",
        instruction: "Select the regulated, low-cost borrowing options to avoid storefront payday loans:",
        options: [
          { id: "opt_p_1", label: "Credit Union Payday Alternative Loans (PALs capped at 28% APR)", correct: true },
          { id: "opt_p_2", label: "Storefront payday rollover advances (300%+ APR)", correct: false },
          { id: "opt_p_3", label: "Small loans from community CDFI networks", correct: true },
          { id: "opt_p_4", label: "Unregulated offshore payday lenders", correct: false }
        ]
      });
    } else {
      lessons.push({
        id: "gen_les_2",
        sort_order: 2,
        title: "Payday Loan Exit Strategies",
        type: "bullet_flow",
        points: [
          "Check if your state mandates Extended Payment Plans (EPPs) at no cost.",
          "Submit EPP request in writing before the day before your loan is due.",
          "Seek out local community-based credit unions for safe transition refinancing."
        ]
      });
    }
    
    if (!isExpress) {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Extended Payment Plans (EPPs)",
        type: "text_block",
        heading: "Freezing Fees Legally",
        body: "Many states require payday lenders to offer an Extended Payment Plan (EPP) if you cannot repay on time. An EPP splits your loan balance into installment payments over several months with zero extra fees. You must request this plan in writing before the day before your payment is due to qualify under state rules."
      });
      lessons.push({
        id: "gen_les_4",
        sort_order: 4,
        title: "Predatory Debt Exit Quiz",
        type: "quiz_assessment",
        question: "When must you request an Extended Payment Plan (EPP) from a payday lender to stop interest and rollover fees?",
        choices: [
          "Any time up to one week after default.",
          "Before the close of business on the day before the loan is due.",
          "At least one month in advance."
        ],
        correct_index: 1,
        explanation: "Under state rules, you must request an EPP before the business day prior to the due date. This freezes fees and converts the loan to installments."
      });
    } else {
      lessons.push({
        id: "gen_les_3",
        sort_order: 3,
        title: "Predatory Debt Assessment",
        type: "quiz_assessment",
        question: "What is the typical Annual Percentage Rate (APR) of a standard storefront payday loan?",
        choices: [
          "Around 12% to 18% APR.",
          "Approximately 24% to 30% APR.",
          "Between 300% and 500% APR."
        ],
        correct_index: 2,
        explanation: "Storefront payday loans routinely range from 300% to over 500% APR due to their extremely short durations and rollover structures."
      });
    }
  }
  
  return {
    id: "course_500_buffer", // Forced target ID
    category_id: "cat_liquidity",
    title: title,
    description: baseDescription,
    duration_label: isExpress ? "4 min" : "8 min",
    income_band_target: [profile.incomeBandV2 || "all"],
    vulnerability_focus: profile.vulnerabilityTags || [],
    version: 3,
    objectives: objectives,
    lessons: lessons
  };
}

function generateCourse() {
  const state = loadState();
  
  // Maps answers dictionary to configuration object
  const config = {
    topic: courseSession.answers[0],
    depth: courseSession.answers[1],
    format: courseSession.answers[2],
    objective: courseSession.answers[3]
  };

  const generatedCourse = generateCustomCourse(config, state.profile);
  
  // Save to localStorage simulation layer
  localStorage.setItem("fined_generated_course", JSON.stringify(generatedCourse));
  
  // Save it as: courses["course_500_buffer"] = generatedCourse;
  if (typeof window !== 'undefined' && window.courses) {
    window.courses["course_500_buffer"] = generatedCourse;
  }
  
  // Redirect to course.html?id=course_500_buffer
  window.location.href = `course.html?id=course_500_buffer`;
}

// ── SETUP EVENT LISTENERS ──────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  if (!state.profile) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeTitle").textContent = `Welcome, ${state.profile.name}`;
  document.getElementById("profileNarrative").textContent = buildNarrative(state.profile);

  document.getElementById("benchmarkBox").innerHTML = `
    <p><strong>Income band:</strong> ${state.profile.benchmark.incomeLabel}</p>
    <p><strong>State:</strong> ${state.profile.benchmark.stateName}</p>
    <p><strong>Vulnerability benchmark:</strong> ${state.profile.benchmark.vulnerabilityIndex}</p>
    <p><strong>Emergency fund rate:</strong> ${state.profile.benchmark.emergencyFundRate}%</p>
    <p><strong>Bill strain rate:</strong> ${state.profile.benchmark.billStrainRate}%</p>
  `;

  renderSignals(state.profile);

  const completed = state.progress?.completedCourses || [];
  const recs = calculateLocalFrontierRoadmap(state.profile, completed);
  const mappedRecs = recs.map(course => ({
    ...course,
    reason: reasonForCourse(course, state.profile),
    locked: false
  }));

  renderRecommendations(mappedRecs);
  renderBriefing();

  const startBtn = document.getElementById("startBuilderBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      // Initialize courseSession
      courseSession = {
        id: "course_500_buffer",
        answers: {},
        currentQuestionIndex: 0
      };
      askQuestion();
    });
  }
});

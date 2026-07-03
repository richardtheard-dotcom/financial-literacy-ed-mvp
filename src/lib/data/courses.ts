import type { Course, CoursePrerequisite } from "../types";

export const COURSES: Course[] = [
  {
    id: "course_overdraft_defense",
    title: "Deconstructing Checking Account Fees",
    description: "Understand ledger vs. available balance and protect your account from $35 overdraft penalty fees.",
    duration: "5 min",
    duration_label: "5 min",
    behaviorTag: "overdraft",
    income_band_target: ["under_35k", "35k_75k", "all"],
    vulnerability_focus: ["overdraft", "financial_stress"],
    content: [
      "Always check your available balance — not ledger balance — before spending.",
      "Contact your bank to opt out of automated debit card overdraft coverage.",
      "Set up automatic low-balance text alerts in your banking app.",
      "Consider linking a secondary account as a free overdraft sweep source.",
    ],
    quiz: {
      question: "What does opting out of overdraft coverage mean for your debit card?",
      choices: [
        "A. Your account is frozen immediately",
        "B. Transactions exceeding your balance are declined at no charge",
        "C. The bank loans you the overdraft amount at no cost",
      ],
    },
  },
  {
    id: "course_500_buffer",
    title: "The $500 Buffer Engine",
    description: "Build a starter emergency reserve to stop high-cost borrowing cycles before they start.",
    duration: "6 min",
    duration_label: "6 min",
    behaviorTag: "emergency_fund",
    income_band_target: ["under_35k", "35k_75k", "all"],
    vulnerability_focus: ["emergency_fund", "financial_stress"],
    content: [
      "Separate non-essential outflows from fixed contractual expenses.",
      "Redirect small cash windfalls — tax refunds, side income — directly into a reserve account.",
      "Keep your buffer in a separate, fee-free account to prevent passive spending.",
      "Treat each buffer contribution as an essential bill you owe to yourself.",
    ],
    quiz: {
      question: "What is the primary purpose of a $500 emergency buffer?",
      choices: [
        "A. To invest in the stock market",
        "B. To avoid high-interest loans during unexpected shortfalls",
        "C. To pay for vacations",
      ],
    },
  },
  {
    id: "course_bill_triage",
    title: "Bill Triage & Consequence Hierarchies",
    description: "Prioritize essential bills during cash-flow disruptions to protect shelter, utilities, and income.",
    duration: "6 min",
    duration_label: "6 min",
    behaviorTag: "bills",
    income_band_target: ["under_35k", "35k_75k", "all"],
    vulnerability_focus: ["bills", "financial_stress"],
    content: [
      "Rank expenses by physical consequence: Tier 1 = housing, utilities, food. Tier 4 = unsecured credit cards.",
      "Unsecured creditors cannot report late payments to bureaus until 30 full days past due.",
      "Contact utility providers early — most offer deferred payment schedules.",
      "Never pay credit card minimums before securing housing or food costs.",
    ],
    quiz: {
      question: "Which expense should be paid first when cash is extremely limited?",
      choices: [
        "A. Credit card minimum payment",
        "B. Streaming subscription renewal",
        "C. Rent or mortgage payment",
      ],
    },
  },
  {
    id: "course_predatory_debt",
    title: "Alternative Credit & Predatory Loan Navigation",
    description: "Understand and exit high-cost payday products using Extended Payment Plans and credit union alternatives.",
    duration: "7 min",
    duration_label: "7 min",
    behaviorTag: "alternative_borrowing",
    income_band_target: ["under_35k", "35k_75k", "all"],
    vulnerability_focus: ["alternative_borrowing", "financial_stress"],
    content: [
      "A $15/$100 payday loan fee translates to a 300–500% APR when annualized.",
      "Many states require payday lenders to offer Extended Payment Plans (EPPs) at no extra charge.",
      "Request EPPs in writing before the business day prior to your due date.",
      "Credit union Payday Alternative Loans (PALs) cap interest at 28% APR.",
    ],
    quiz: {
      question: "What is the typical APR range for a storefront payday loan?",
      choices: [
        "A. 12–18% APR",
        "B. 50–100% APR",
        "C. 300–500% APR",
      ],
    },
  },
];

// V2 courses (lesson-based) — populated at runtime by the course builder
export const COURSES_V2: Course[] = [];

export const COURSE_PREREQUISITES: CoursePrerequisite[] = [
  {
    course_id: "course_predatory_debt",
    requires_prerequisite_id: "course_overdraft_defense",
  },
];

export function getCourseById(id: string, generatedCourse?: Course | null): Course | undefined {
  if (generatedCourse && generatedCourse.id === id) return generatedCourse;
  return COURSES.find((c) => c.id === id) ?? COURSES_V2.find((c) => c.id === id);
}

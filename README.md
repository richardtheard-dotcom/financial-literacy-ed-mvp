# FinEd

Personalized financial literacy platform. Onboarding builds a behavioral and knowledge profile from a short assessment, a recommendation engine matches that profile against a lesson catalog, and a lesson player delivers multi-step courses with interactive checks.

No build step, no backend, no dependencies. Static HTML/CSS/JS, state persisted in `localStorage`.

## Features

- **Adaptive onboarding** — 6-step assessment covering account info, a financial knowledge quiz, habit/vulnerability signals, goals, and optional location/demographic context.
- **Tag-based recommendation engine** (`engine.js`) — matches courses to a user by income band and vulnerability tags (bills, emergency fund, overdraft, high-cost borrowing, financial stress), respecting a course prerequisite graph and capping recommendations at 3 to avoid overload.
- **Multi-lesson course player** — supports `text_block`, `bullet_flow`, `interactive_isolation`, and `quiz_assessment` lesson types, with per-lesson progress tracking and locked/unlocked prerequisite states.
- **Progress tracking** — streaks, completion counts, and a re-assessment flow.
- **Two coexisting course schemas** — a legacy single-view schema (5 courses) and a newer multi-lesson schema (4 courses, `COURSES_V2`), unified transparently at the dashboard and course-player level. Legacy courses act as a fallback fill if the engine returns fewer than 3 matches for a profile.

## Project structure

```
fined/
├── index.html              # Onboarding flow
├── dashboard.html           # Personalized roadmap
├── course.html               # Lesson player
├── progress.html             # Streaks, completion, re-assessment
├── assets/
│   └── css/
│       └── app.css
└── js/
    ├── app-state.js          # localStorage state layer (load/save/reset/update)
    ├── onboarding.js          # Assessment logic, scoring, profile construction
    ├── dashboard.js            # Recommendation rendering, engine integration
    ├── course.js                # Lesson player, prerequisite enforcement
    ├── progress.js               # Streak and completion display
    ├── engine.js                  # calculateLocalFrontierRoadmap() — tag/prereq matching
    └── data/
        ├── courses.js              # COURSES (legacy) + COURSES_V2 + CATEGORIES + COURSE_PREREQUISITES
        └── benchmarks.js             # Income-band and state benchmark data
```

FinEd is a personalized financial literacy platform designed to provide users with learning experiences tailored to their financial knowledge, behaviors, and goals. The system begins with a short onboarding assessment that builds a user profile, which is then analyzed by a recommendation engine to suggest the most relevant financial education courses. Recommendations are personalized using factors such as income level, financial habits, and areas where users may need additional support, while also ensuring courses are completed in a logical learning sequence.

The platform delivers content through interactive, multi-step lessons that include explanations, guided activities, and quizzes to reinforce learning. It also tracks user progress, course completions, and learning streaks, allowing users to monitor their development and retake assessments as their financial situations change.

This application is originally built upon static HTML, CSS, and JavaScript, FinEd requires no backend or external dependencies. User information and progress are stored locally using `localStorage`, making the application lightweight, simple to deploy, and easy to maintain. Its modular design separates onboarding, recommendations, course delivery, progress tracking, and data management, providing a solid foundation for future enhancements and additional learning content.
// ── Lookup across both the legacy list and the new lesson-based list ───────
function getCourseById(id) {
  if (typeof window !== 'undefined' && window.courses && window.courses[id]) {
    return window.courses[id];
  }
  const legacy = COURSES.find(c => c.id === id);
  if (legacy) return legacy;
  const v2 = (typeof COURSES_V2 !== "undefined" ? COURSES_V2 : []).find(c => c.id === id);
  if (v2) return v2;
  return COURSES[0];
}

function isLessonCourse(course) {
  return Array.isArray(course.lessons) && course.lessons.length > 0;
}

// Helper functions for URL loading
function showError(message) {
  const msgEl = document.getElementById("courseMessage");
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.classList.remove("hidden");
    msgEl.style.background = "#fee2e2";
    msgEl.style.borderLeft = "4px solid #ef4444";
    msgEl.style.color = "#b91c1c";
  } else {
    alert(message);
  }
}

function redirectToDashboard() {
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 2000);
}

function renderCourse(course) {
  if (isLessonCourse(course)) {
    renderLessonCourse(course);
  } else {
    renderLegacyCourse(course);
  }
  
  // Trigger state loaded callback
  if (typeof window.onCourseLoaded === 'function') {
    window.onCourseLoaded(course.id);
  }
}

function loadCourseFromURL() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");

  if (!courseId) {
    showError("No course ID provided");
    return;
  }

  // Load matching course from courses.js (mapped inside window.courses)
  const course = (typeof window !== 'undefined' && window.courses) ? window.courses[courseId] : getCourseById(courseId);

  if (!course) {
    showError("Course not found");
    redirectToDashboard();
    return;
  }

  renderCourse(course);
}

// ── Legacy single-view renderer ─────────────────────────────────────────────
function renderLegacyCourse(course) {
  // Hide sidebar layout if not a lesson course
  const layout = document.getElementById("coursePlayerLayout");
  if (layout) {
    layout.style.gridTemplateColumns = "1fr";
  }
  const aside = document.querySelector("aside");
  if (aside) {
    aside.style.display = "none";
  }
  const progressContainer = document.getElementById("lessonProgressContainer");
  if (progressContainer) {
    progressContainer.style.display = "none";
  }
  const prevBtn = document.getElementById("prevBtn");
  if (prevBtn) {
    prevBtn.style.display = "none";
  }

  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("courseMeta").textContent = `${course.duration || "5 min"} • ${course.behaviorTag || "Personalized"}`;
  document.getElementById("courseBody").innerHTML = `
    <p>${escapeHtml(course.description)}</p>
    <ol>${course.content.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ol>
    <div class="review-box">
      <strong>Quick check:</strong>
      <p>${escapeHtml(course.quiz.question)}</p>
      <ol type="A">
        ${course.quiz.choices.map(choice => `<li>${escapeHtml(choice)}</li>`).join("")}
      </ol>
    </div>
  `;
  
  const completeBtn = document.getElementById("completeBtn");
  completeBtn.textContent = "Mark complete";
  completeBtn.classList.remove("hidden");
  completeBtn.disabled = false;
  
  completeBtn.onclick = () => {
    updateState((state) => {
      if (!state.progress.completedCourses.includes(course.id)) {
        state.progress.completedCourses.push(course.id);
      }
      state.currentCourseId = course.id;
    });
    updateStreak();
    const message = document.getElementById("courseMessage");
    message.textContent = `${course.title} marked complete. Your streak has been updated.`;
    message.classList.remove("hidden");
    message.style.background = "var(--soft)";
    message.style.borderLeft = "4px solid var(--accent)";
    message.style.color = "var(--text)";
  };
}

// ── New multi-lesson player ─────────────────────────────────────────────────
function renderLessonBody(course, lessonIndex) {
  const lesson = course.lessons[lessonIndex];
  const stepLabel = `Lesson ${lessonIndex + 1} of ${course.lessons.length}`;

  let inner = "";
  if (lesson.type === "text_block") {
    inner = `
      <p class="muted">${stepLabel}</p>
      <h3>${escapeHtml(lesson.heading || lesson.title)}</h3>
      ${lesson.body.split("\n\n").map(p => `<p>${escapeHtml(p)}</p>`).join("")}
    `;
  } else if (lesson.type === "bullet_flow") {
    inner = `
      <p class="muted">${stepLabel}</p>
      <h3>${escapeHtml(lesson.title)}</h3>
      <ul>${lesson.points.map(pt => `<li>${escapeHtml(pt)}</li>`).join("")}</ul>
    `;
  } else if (lesson.type === "interactive_isolation") {
    inner = `
      <p class="muted">${stepLabel}</p>
      <h3>${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(lesson.instruction)}</p>
      <div id="isolationOptions">
        ${lesson.options.map(opt => `
          <label class="field" style="display:flex;align-items:center;gap:10px;font-weight:400;">
            <input type="checkbox" data-correct="${opt.correct}" style="width:auto;" />
            ${escapeHtml(opt.label)}
          </label>
        `).join("")}
      </div>
      <button type="button" id="checkIsolationBtn" class="secondary" style="margin-top: 10px;">Check my answer</button>
      <p id="isolationFeedback" class="muted" style="margin-top: 8px; font-weight: 500; min-height: 1.2em;"></p>
    `;
  } else if (lesson.type === "quiz_assessment") {
    const q = lesson.content_json || lesson;
    inner = `
      <p class="muted">${stepLabel}</p>
      <h3>${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(q.question)}</p>
      <div id="quizChoices" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
        ${q.choices.map((choice, i) => `
          <label class="field" style="display:flex;align-items:center;gap:10px;font-weight:400; margin: 0;">
            <input type="radio" name="quizChoice" value="${i}" style="width:auto;" />
            ${escapeHtml(choice)}
          </label>
        `).join("")}
      </div>
      <button type="button" id="checkQuizBtn" class="secondary">Check my answer</button>
      <p id="quizFeedback" class="muted" style="margin-top: 8px; font-weight: 500; min-height: 1.2em;"></p>
    `;
  }

  document.getElementById("courseBody").innerHTML = inner;
}

function wireLessonInteractions(course, lessonIndex, onAdvanceReady) {
  const lesson = course.lessons[lessonIndex];

  if (lesson.type === "text_block" || lesson.type === "bullet_flow") {
    onAdvanceReady(true);
    return;
  }

  if (lesson.type === "interactive_isolation") {
    onAdvanceReady(false);
    document.getElementById("checkIsolationBtn").addEventListener("click", () => {
      const boxes = [...document.querySelectorAll("#isolationOptions input[type=checkbox]")];
      const allCorrect = boxes.every(b => b.checked === (b.dataset.correct === "true"));
      document.getElementById("isolationFeedback").textContent = allCorrect
        ? "Nice — that's exactly right."
        : "Not quite. Check your selections and try again.";
      if (allCorrect) onAdvanceReady(true);
    });
  }

  if (lesson.type === "quiz_assessment") {
    onAdvanceReady(false);
    const q = lesson.content_json || lesson;
    document.getElementById("checkQuizBtn").addEventListener("click", () => {
      const picked = document.querySelector("#quizChoices input[type=radio]:checked");
      const feedback = document.getElementById("quizFeedback");
      if (!picked) {
        feedback.textContent = "Pick an answer first.";
        return;
      }
      const correct = Number(picked.value) === q.correct_index;
      feedback.textContent = correct
        ? `Correct. ${q.explanation}`
        : `Not quite. ${q.explanation}`;
      if (correct) onAdvanceReady(true);
    });
  }
}

function renderLessonCourse(course) {
  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("courseMeta").textContent = `${course.duration_label || "8 min"} • ${course.lessons.length} lessons`;

  const state = loadState();
  let lessonIndex = Math.min(getLessonIndex(state, course.id), course.lessons.length - 1);

  const completeBtn = document.getElementById("completeBtn");
  const prevBtn = document.getElementById("prevBtn");
  const message = document.getElementById("courseMessage");
  const sidebarNav = document.getElementById("sidebarNav");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  // Render Sidebar navigation links
  function renderSidebar() {
    if (sidebarNav) {
      sidebarNav.innerHTML = course.lessons.map((lesson, idx) => `
        <div class="sidebar-link ${idx === lessonIndex ? "active" : ""}" data-idx="${idx}">
          ${idx + 1}. ${escapeHtml(lesson.title)}
        </div>
      `).join("");
      
      // Add event listeners to sidebar items
      sidebarNav.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", () => {
          lessonIndex = Number(link.dataset.idx);
          setLessonIndex(course.id, lessonIndex);
          draw();
        });
      });
    }
  }

  function draw() {
    renderSidebar();
    renderLessonBody(course, lessonIndex);
    
    // Update progress bar
    const progressPercent = ((lessonIndex + 1) / course.lessons.length) * 100;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (progressText) progressText.textContent = `${lessonIndex + 1}/${course.lessons.length}`;

    // Update navigation buttons
    const isLast = lessonIndex === course.lessons.length - 1;
    completeBtn.textContent = isLast ? "Complete course" : "Continue";
    completeBtn.disabled = true;

    prevBtn.disabled = lessonIndex === 0;

    wireLessonInteractions(course, lessonIndex, (ready) => {
      completeBtn.disabled = !ready;
    });
  }

  draw();

  prevBtn.onclick = () => {
    if (lessonIndex > 0) {
      lessonIndex -= 1;
      setLessonIndex(course.id, lessonIndex);
      draw();
    }
  };

  completeBtn.onclick = () => {
    const isLast = lessonIndex === course.lessons.length - 1;
    if (!isLast) {
      lessonIndex += 1;
      setLessonIndex(course.id, lessonIndex);
      draw();
      return;
    }
    updateState((s) => {
      if (!s.progress.completedCourses.includes(course.id)) {
        s.progress.completedCourses.push(course.id);
      }
      s.currentCourseId = course.id;
    });
    updateStreak();
    
    message.textContent = `${course.title} marked complete. Your streak has been updated.`;
    message.classList.remove("hidden");
    message.style.background = "var(--soft)";
    message.style.borderLeft = "4px solid var(--accent)";
    message.style.color = "var(--text)";
    completeBtn.disabled = true;
  };
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCourseFromURL();
});

function getCompletedNames(ids) {
  return ids.map(id => {
    const course = COURSES.find(c => c.id === id);
    return course ? course.title : id;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  const completed = state.progress.completedCourses || [];
  const next = COURSES.find(course => !completed.includes(course.id));

  document.getElementById("streakValue").textContent = `${state.progress.streak || 0} days`;
  document.getElementById("streakMessage").textContent = isCompleteToday(state.progress.lastActiveDate)
    ? "You have been active today."
    : "Return today to keep your streak moving.";

  document.getElementById("completionValue").textContent = `${completed.length}/${COURSES.length} courses`;
  document.getElementById("nextUnlock").textContent = next
    ? `Next unlock: ${next.title}`
    : "You have completed the current roadmap.";

  document.getElementById("completedList").innerHTML = getCompletedNames(completed)
    .map(name => `<li>${name}</li>`)
    .join("") || "<li>No courses completed yet.</li>";

  document.getElementById("reassessBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    resetState();
    window.location.href = "index.html";
  });
});

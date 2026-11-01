"use strict";

const STORAGE_KEY = "planner-tasks";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const courseInput = document.getElementById("task-course");
const dueInput = document.getElementById("task-due");
const titleError = document.getElementById("task-title-error");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("task-empty");
const countText = document.getElementById("task-count");
const progressBar = document.getElementById("task-progress");
const clearDoneButton = document.getElementById("clear-done");
const status = document.getElementById("planner-status");
const showButtons = document.querySelectorAll("[data-show]");

let tasks = loadTasks();
let show = "all";

/** Reads saved tasks, falling back to an empty list if storage is blocked or the data is damaged. */
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    // Storage blocked: the planner still works, it just won't remember tasks after a refresh.
  }
}

function announce(message) {
  status.textContent = message;
}

/** Today's date as YYYY-MM-DD in local time, to compare with <input type="date"> values. */
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function formatDate(value) {
  // "T00:00" keeps the date in local time; a bare YYYY-MM-DD is parsed as UTC and can land on the day before.
  return new Date(value + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Soonest deadline first; tasks without a date go last.
 * Completed tasks keep their place so the list doesn't jump when one is ticked.
 */
function sortTasks(a, b) {
  if (a.due && b.due) return a.due.localeCompare(b.due);
  if (a.due) return -1;
  if (b.due) return 1;
  return a.created - b.created;
}

function buildTaskItem(task) {
  const item = document.createElement("li");
  item.className = "task" + (task.done ? " is-done" : "");

  const checkboxId = "task-" + task.id;
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = checkboxId;
  checkbox.checked = task.done;
  checkbox.className = "task-check";
  checkbox.addEventListener("change", function () {
    toggleTask(task.id);
  });

  const text = document.createElement("div");
  text.className = "task-text";

  const label = document.createElement("label");
  label.htmlFor = checkboxId;
  label.className = "task-title";
  label.textContent = task.title;
  text.appendChild(label);

  const details = [];
  if (task.course) details.push(task.course);
  if (task.due) details.push("Due " + formatDate(task.due));
  if (details.length) {
    const meta = document.createElement("p");
    meta.className = "task-meta";
    meta.textContent = details.join(" · ");
    if (!task.done && task.due && task.due < todayString()) {
      const badge = document.createElement("span");
      badge.className = "badge-overdue";
      badge.textContent = "Overdue";
      meta.append(" ", badge);
    }
    text.appendChild(meta);
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "task-delete";
  remove.innerHTML = '<span aria-hidden="true">✕</span> Delete';
  // The visible text is short; screen readers hear which task the button deletes.
  remove.setAttribute("aria-label", "Delete “" + task.title + "”");
  remove.addEventListener("click", function () {
    deleteTask(task.id);
  });

  item.append(checkbox, text, remove);
  return item;
}

function render() {
  const sorted = tasks.slice().sort(sortTasks);
  const visible = sorted.filter(function (task) {
    if (show === "active") return !task.done;
    if (show === "done") return task.done;
    return true;
  });

  list.replaceChildren.apply(list, visible.map(buildTaskItem));

  const doneCount = tasks.filter(function (task) { return task.done; }).length;
  countText.textContent = doneCount + " of " + tasks.length + " done";
  progressBar.style.width = tasks.length ? (doneCount / tasks.length) * 100 + "%" : "0%";
  clearDoneButton.hidden = doneCount === 0;

  emptyState.hidden = visible.length > 0;
  if (tasks.length === 0) {
    emptyState.textContent = "No tasks yet. Add your first one with the form.";
  } else if (show === "active") {
    emptyState.textContent = "Nothing left to do. Nice work!";
  } else if (show === "done") {
    emptyState.textContent = "No completed tasks yet.";
  }
}

function addTask(title, course, due) {
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: title,
    course: course,
    due: due,
    done: false,
    created: Date.now(),
  });
  saveTasks();
  render();
  announce("Added “" + title + "”.");
}

function toggleTask(id) {
  const task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
  // Re-rendering replaces the checkbox, so put focus back on its replacement (if it is still shown).
  const checkbox = document.getElementById("task-" + id);
  if (checkbox) checkbox.focus();
  announce("“" + task.title + "” marked as " + (task.done ? "completed." : "not completed."));
}

function deleteTask(id) {
  const sortedIds = tasks.slice().sort(sortTasks).map(function (t) { return t.id; });
  const index = sortedIds.indexOf(id);
  const task = tasks.find(function (t) { return t.id === id; });
  tasks = tasks.filter(function (t) { return t.id !== id; });
  saveTasks();
  render();
  // Focus would otherwise drop to the page; move it to the next task, or back to the form.
  const nextId = sortedIds[index + 1] || sortedIds[index - 1];
  const next = nextId && document.getElementById("task-" + nextId);
  (next || titleInput).focus();
  announce("Deleted “" + task.title + "”.");
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === "") {
    titleError.textContent = "Enter a task.";
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }
  titleError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  addTask(title, courseInput.value.trim(), dueInput.value);
  form.reset();
  titleInput.focus();
});

titleInput.addEventListener("input", function () {
  if (titleInput.value.trim() !== "") {
    titleError.textContent = "";
    titleInput.removeAttribute("aria-invalid");
  }
});

showButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    show = button.dataset.show;
    showButtons.forEach(function (other) {
      other.setAttribute("aria-pressed", String(other === button));
    });
    render();
  });
});

clearDoneButton.addEventListener("click", function () {
  const removed = tasks.filter(function (t) { return t.done; }).length;
  tasks = tasks.filter(function (t) { return !t.done; });
  saveTasks();
  render();
  titleInput.focus();
  announce("Deleted " + removed + (removed === 1 ? " completed task." : " completed tasks."));
});

render();

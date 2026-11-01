"use strict";

/* ---------- Mobile menu ---------- */

function setUpMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------- Theme toggle ---------- */

function setUpThemeToggle() {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function isDark() {
    const chosen = document.documentElement.getAttribute("data-theme");
    return chosen ? chosen === "dark" : systemDark.matches;
  }

  // The label names the theme the button switches to, so it always matches what a click does.
  function updateButton() {
    const label = button.querySelector(".theme-label");
    if (label) label.textContent = isDark() ? "Light mode" : "Dark mode";
  }

  button.addEventListener("click", function () {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      // Storage can be blocked (private mode); the theme still applies for this visit.
    }
    updateButton();
  });

  systemDark.addEventListener("change", updateButton);
  updateButton();
}

/* ---------- Start ---------- */

document.getElementById("year").textContent = String(new Date().getFullYear());
setUpMobileMenu();
setUpThemeToggle();

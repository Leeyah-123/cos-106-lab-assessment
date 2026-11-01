"use strict";

(function setUpProjectFilters() {
  const buttons = document.querySelectorAll(".filter-button");
  const projects = document.querySelectorAll(".project");
  const status = document.querySelector(".filter-status");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;
      let shown = 0;

      buttons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });

      projects.forEach(function (project) {
        const categories = project.dataset.category.split(" ");
        const match = filter === "all" || categories.includes(filter);
        project.hidden = !match;
        if (match) shown += 1;
      });

      // Announced to screen readers, since the change happens away from the button.
      if (status) {
        status.textContent = "Showing " + shown + (shown === 1 ? " project" : " projects") + ".";
      }
    });
  });
})();

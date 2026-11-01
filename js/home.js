"use strict";

(function setUpGreeting() {
  const audio = document.getElementById("greeting");
  const button = document.querySelector(".audio-button");
  const tooltip = document.getElementById("audio-tip");
  const transcript = document.querySelector(".transcript");
  if (!audio || !button) return;
  const label = button.querySelector(".visually-hidden");
  let hideTimer = null;

  // The accessible name and the tooltip always describe what the next click does.
  function updateButton() {
    const playing = !audio.paused;
    const text = playing ? "Pause my greeting" : "Play my greeting";
    button.classList.toggle("is-playing", playing);
    if (label) label.textContent = text;
    if (tooltip) tooltip.textContent = text;
  }

  // The transcript shows like a subtitle while the clip plays, then lingers briefly so it can be finished.
  function showTranscript(show) {
    if (!transcript) return;
    clearTimeout(hideTimer);
    if (show) {
      transcript.classList.add("is-showing");
    } else {
      hideTimer = setTimeout(function () {
        transcript.classList.remove("is-showing");
      }, 2500);
    }
  }

  button.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().catch(function () {
        if (tooltip) tooltip.textContent = "Sorry, the audio couldn’t play";
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", function () { updateButton(); showTranscript(true); });
  audio.addEventListener("pause", function () { updateButton(); showTranscript(false); });
  audio.addEventListener("ended", function () { updateButton(); showTranscript(false); });

  if (tooltip) {
    // Esc hides the tooltip without moving focus (WCAG 1.4.13).
    button.addEventListener("keydown", function (event) {
      if (event.key === "Escape") tooltip.classList.add("is-dismissed");
    });
    ["mouseenter", "focus"].forEach(function (name) {
      button.addEventListener(name, function () { tooltip.classList.remove("is-dismissed"); });
    });
  }
})();

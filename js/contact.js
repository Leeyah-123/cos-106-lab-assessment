"use strict";

const CONTACT_EMAIL = "a.junaid8240@miva.edu.ng";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_ONLY = /^[0-9]+$/;

/** Returns an error message for a field, or an empty string when it is valid. */
function validateField(field) {
  const value = field.value.trim();

  if (field.name === "name") {
    if (value === "") return "Enter your name.";
    if (value.length < 2) return "Your name must be at least 2 characters.";
  }
  if (field.name === "email") {
    if (value === "") return "Enter your email address.";
    if (!EMAIL_PATTERN.test(value)) return "Enter an email address like name@example.com.";
  }
  if (field.name === "phone") {
    if (value === "") return "Enter your phone number.";
    if (!DIGITS_ONLY.test(value)) return "Your phone number can only contain digits (0–9), with no spaces or symbols.";
  }
  if (field.name === "message") {
    if (value === "") return "Enter a message.";
    if (value.length < 10) return "Your message must be at least 10 characters.";
  }
  return "";
}

function showFieldError(field, message) {
  const error = document.getElementById(field.id + "-error");
  if (error) error.textContent = message;
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}

(function setUpContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const fields = Array.from(form.querySelectorAll("input, textarea"));
  const status = form.querySelector(".form-status");

  // Only re-check on input once a field has been flagged, so people aren't scolded mid-typing.
  fields.forEach(function (field) {
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") {
        showFieldError(field, validateField(field));
      }
    });
    field.addEventListener("blur", function () {
      if (field.value.trim() !== "") showFieldError(field, validateField(field));
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let firstInvalid = null;

    fields.forEach(function (field) {
      const message = validateField(field);
      showFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      status.textContent = "Please fix the highlighted fields.";
      firstInvalid.focus();
      return;
    }

    // There is no server, so the message is handed to the visitor's email app to send.
    const data = new FormData(form);
    const subject = "Portfolio message from " + data.get("name").trim();
    const body = data.get("message").trim() + "\n\nFrom: " + data.get("name").trim() + " <" + data.get("email").trim() + ">" +
      "\nPhone: " + data.get("phone").trim();
    window.location.href =
      "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    status.textContent = "Thanks! Your email app should open with the message ready to send.";
    form.reset();
  });
})();

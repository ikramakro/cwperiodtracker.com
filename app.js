(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var cfg = window.CYCLEWISE_CONFIG || {};
  var endpoint = (cfg.FORM_ENDPOINT || "").trim();
  var host = location.hostname;
  var isPreview = location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "" ||
                  /[?&]preview=1\b/.test(location.search);

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year in footer
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Header border on scroll
  var header = document.querySelector(".site-header");
  var onScroll = function () { header && header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Gentle reveal-on-scroll (skipped for reduced motion)
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".card, .feature, .list-block");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
    // Safety net: never leave content hidden if the observer misses something.
    setTimeout(function () { targets.forEach(function (el) { el.classList.add("in"); }); }, 2500);
  }

  // ---------- Waitlist form ----------
  var form = document.getElementById("waitlist-form");
  if (!form) return;
  var btn = document.getElementById("submit-btn");
  var status = document.getElementById("form-status");
  var success = document.getElementById("success");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    "first-name": function (el) {
      var v = el.value.trim();
      if (!v) return "Please tell us your first name.";
      if (v.length > 60) return "That’s a bit long — 60 characters max.";
      return "";
    },
    "email": function (el) {
      var v = el.value.trim();
      if (!v) return "Please enter your email.";
      if (!EMAIL_RE.test(v)) return "That email doesn’t look quite right.";
      return "";
    },
    "consent": function (el) { return el.checked ? "" : "Please agree so we can email you when the app is ready."; },
    "age": function (el) { return el.checked ? "" : "CycleWise is for ages 13 and up."; }
  };

  function validateField(id) {
    var el = document.getElementById(id);
    var msg = rules[id](el);
    var err = document.getElementById(id + "-error");
    if (err) err.textContent = msg;
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    return !msg;
  }

  Object.keys(rules).forEach(function (id) {
    var el = document.getElementById(id);
    var evt = el.type === "checkbox" ? "change" : "blur";
    el.addEventListener(evt, function () { validateField(id); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) validateField(id); });
  });

  function setLoading(on) {
    btn.disabled = on;
    btn.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span><span class="btn-label">Saving your spot…</span>'
                       : '<span class="btn-label">Join the waitlist</span>';
  }

  function showSuccess(name) {
    var n = document.getElementById("success-name");
    if (n) n.textContent = name ? ", " + name : "";
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function showError(msg) {
    status.className = "form-status is-error";
    status.textContent = msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = ""; status.className = "form-status";

    var ids = Object.keys(rules), firstBad = null;
    ids.forEach(function (id) { if (!validateField(id) && !firstBad) firstBad = id; });
    if (firstBad) { document.getElementById(firstBad).focus(); return; }

    // Honeypot: silently "succeed" for bots
    if (form.querySelector('[name="_gotcha"]').value) { showSuccess(""); return; }

    var name = document.getElementById("first-name").value.trim();
    var data = new FormData(form);
    data.set("first_name", name);
    data.set("email", document.getElementById("email").value.trim());
    data.set("source", "cyclewise-waitlist-page");
    data.set("page", location.href.split("#")[0]);
    if (cfg.NOTIFY_SUBJECT) data.set("_subject", cfg.NOTIFY_SUBJECT);

    if (!endpoint) {
      if (isPreview) {
        console.info("[CycleWise] Preview mode: FORM_ENDPOINT is empty in config.js, so nothing was sent.", Object.fromEntries(data.entries()));
        showSuccess(name);
      } else {
        console.error("[CycleWise] FORM_ENDPOINT is not set in config.js — sign-ups are not being saved.");
        showError("Sorry — we couldn’t save your spot just now. Please try again a little later.");
      }
      return;
    }

    setLoading(true);
    fetch(endpoint, { method: "POST", body: data, headers: { "Accept": "application/json" } })
      .then(function (res) {
        if (res.ok) { showSuccess(name); return; }
        return res.json().catch(function () { return {}; }).then(function (j) {
          var detail = j && j.errors && j.errors.length ? j.errors.map(function (x) { return x.message; }).join(" ") : "";
          throw new Error(detail || ("HTTP " + res.status));
        });
      })
      .catch(function (err) {
        console.error("[CycleWise] Waitlist submit failed:", err);
        showError("Sorry — something went wrong saving your spot. Please check your connection and try again.");
      })
      .then(function () { setLoading(false); });
  });

  // Share button on success screen
  var share = document.getElementById("share-btn");
  if (share) share.addEventListener("click", function () {
    var url = location.href.split("#")[0];
    var payload = { title: "CycleWise — a private period tracker", text: "A private period tracker for Android with no account needed. Waitlist is open:", url: url };
    if (navigator.share) { navigator.share(payload).catch(function () {}); return; }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { share.textContent = "Link copied"; });
    } else { window.prompt("Copy this link:", url); }
  });
})();

(function () {
  "use strict";

  var SESSION_KEY = "delegue_session";
  var SESSION_DURATION_MS = 30 * 60 * 1000;

  /* SHA-256 hash (Web Crypto API) */
  function sha256(text) {
    var encoder = new TextEncoder();
    return crypto.subtle.digest("SHA-256", encoder.encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, "0"); })
        .join("");
    });
  }

  /*
   * For the demo only: credentials are compared via SHA-256 hash so the
   * plaintext password is never stored in source. In production, replace
   * this with a real server-side authentication endpoint.
   *
   * Default demo credentials:
   *   username: delegue
   *   password: Portail2026!
   */
  var VALID_USERNAME = "delegue";
  var VALID_PASSWORD_HASH =
    "e5b21c53a6fcf33c242a4eeab94260c7439caea44bfa24b658e3db5f0e2ea9bc";

  function hashPassword(password) {
    return sha256(password);
  }

  function setSession() {
    var session = {
      user: VALID_USERNAME,
      expires: Date.now() + SESSION_DURATION_MS,
    };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (_) {
      /* storage unavailable */
    }
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var session = JSON.parse(raw);
      if (typeof session.expires !== "number" || Date.now() > session.expires) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch (_) {
      return null;
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {
      /* ignore */
    }
  }

  /* ---- DOM refs ---- */
  var authScreen = document.getElementById("auth-screen");
  var delegateLayout = document.getElementById("delegate-layout");
  var authForm = document.getElementById("auth-form");
  var usernameInput = document.getElementById("auth-username");
  var passwordInput = document.getElementById("auth-password");

  var MAX_ATTEMPTS = 5;
  var LOCKOUT_MS = 60 * 1000;
  var failedAttempts = 0;
  var lockoutUntil = 0;

  function showDashboard() {
    if (authScreen) authScreen.hidden = true;
    if (delegateLayout) delegateLayout.hidden = false;
    document.body.classList.remove("auth-only");
  }

  function showAuthScreen() {
    if (authScreen) authScreen.hidden = false;
    if (delegateLayout) delegateLayout.hidden = true;
    document.body.classList.add("auth-only");
  }

  function showError(message) {
    var existing = authForm.querySelector(".auth-error");
    if (existing) existing.remove();
    var el = document.createElement("p");
    el.className = "auth-error";
    el.style.cssText =
      "color:#dc2626;background:#fef2f2;padding:12px 14px;border-radius:12px;" +
      "border:1px solid #fecaca;margin:0;font-weight:600;";
    el.textContent = message;
    authForm.insertBefore(el, authForm.querySelector("button[type='submit']"));
  }

  /* ---- Init ---- */
  if (getSession()) {
    showDashboard();
  } else {
    showAuthScreen();
  }

  /* ---- Login handler ---- */
  if (authForm) {
    authForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (Date.now() < lockoutUntil) {
        var seconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
        showError(
          "Trop de tentatives. Veuillez patienter " + seconds + " secondes."
        );
        return;
      }

      var username = (usernameInput.value || "").trim();
      var password = passwordInput.value || "";

      if (!username || !password) {
        showError("Veuillez remplir tous les champs.");
        return;
      }

      if (username !== VALID_USERNAME) {
        failedAttempts++;
        if (failedAttempts >= MAX_ATTEMPTS) {
          lockoutUntil = Date.now() + LOCKOUT_MS;
          failedAttempts = 0;
        }
        showError("Identifiants incorrects.");
        return;
      }

      hashPassword(password).then(function (hash) {
        if (hash === VALID_PASSWORD_HASH) {
          setSession();
          showDashboard();
        } else {
          failedAttempts++;
          if (failedAttempts >= MAX_ATTEMPTS) {
            lockoutUntil = Date.now() + LOCKOUT_MS;
            failedAttempts = 0;
          }
          showError("Identifiants incorrects.");
        }
      });
    });
  }

  /* ---- Logout ---- */
  function handleLogout() {
    clearSession();
    showAuthScreen();
    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    var err = authForm && authForm.querySelector(".auth-error");
    if (err) err.remove();
  }

  var sideLogout = document.getElementById("side-logout");
  var topLogout = document.getElementById("top-logout");
  if (sideLogout) sideLogout.addEventListener("click", handleLogout);
  if (topLogout) topLogout.addEventListener("click", handleLogout);

  /* ---- Sidebar toggle (mobile) ---- */
  var menuToggle = document.getElementById("menu-toggle");
  var sidebar = document.getElementById("sidebar");
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  /* ---- Search filter ---- */
  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var query = this.value.toLowerCase().trim();
      var rows = document.querySelectorAll("tbody tr");
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
      });
    });
  }

  /* ---- File upload preview ---- */
  var fileInput = document.getElementById("file-input");
  var filePreview = document.getElementById("file-preview");
  var ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx"];
  var MAX_FILE_SIZE = 10 * 1024 * 1024;

  if (fileInput && filePreview) {
    fileInput.addEventListener("change", function () {
      var file = this.files[0];
      if (!file) {
        filePreview.innerHTML = "<span>Aucun fichier selectionne</span>";
        return;
      }
      var ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
        filePreview.innerHTML =
          "<span style='color:#dc2626'>Type de fichier non autorise.</span>";
        fileInput.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        filePreview.innerHTML =
          "<span style='color:#dc2626'>Fichier trop volumineux (max 10 Mo).</span>";
        fileInput.value = "";
        return;
      }
      var safeName = file.name.replace(/[<>"'&]/g, "");
      filePreview.textContent = safeName + " (" + (file.size / 1024).toFixed(1) + " Ko)";
    });
  }

  /* ---- Dropzone visual feedback ---- */
  var dropzone = document.getElementById("dropzone");
  if (dropzone) {
    dropzone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", function () {
      this.classList.remove("dragover");
    });
    dropzone.addEventListener("drop", function () {
      this.classList.remove("dragover");
    });
  }

  /* ---- Notification helper ---- */
  function showNotification(message) {
    var el = document.querySelector(".notification");
    if (!el) return;
    el.textContent = message;
    el.classList.add("visible");
    setTimeout(function () {
      el.classList.remove("visible");
    }, 3000);
  }

  /* ---- Publish button (demo) ---- */
  var publishButton = document.getElementById("publish-button");
  if (publishButton) {
    publishButton.addEventListener("click", function () {
      showNotification("Document publie avec succes (demo).");
    });
  }

  /* ---- Notify button ---- */
  var notifyButton = document.getElementById("notify-button");
  if (notifyButton) {
    notifyButton.addEventListener("click", function () {
      showNotification("Aucune nouvelle notification.");
    });
  }
})();

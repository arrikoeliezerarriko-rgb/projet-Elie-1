(function () {
  "use strict";

  var SESSION_KEY = "delegue_session";

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

  /* Redirect unauthenticated users to the delegate login page */
  if (!getSession()) {
    window.location.replace("espace-delegue.html");
    return;
  }

  /* ---- Logout ---- */
  function handleLogout() {
    clearSession();
    window.location.replace("espace-delegue.html");
  }

  var logoutLink = document.querySelector('a.side-link.danger[href="#logout"]');
  var logoutButton = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      handleLogout();
    });
  }
  if (logoutButton) logoutButton.addEventListener("click", handleLogout);

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

  /* ---- File upload preview with validation ---- */
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

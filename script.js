(function () {
  "use strict";

  /* ---- Mobile sidebar toggle ---- */
  var menuButton = document.querySelector(".mobile-menu-button");
  var sidebar = document.querySelector(".sidebar");
  if (menuButton && sidebar) {
    menuButton.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("open");
      this.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ---- Search / filter documents ---- */
  var searchInput = document.getElementById("document-search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var query = this.value.toLowerCase().trim();
      var rows = document.querySelectorAll("[data-document]");
      rows.forEach(function (row) {
        if (!query) {
          row.hidden = false;
          return;
        }
        var title = (row.getAttribute("data-title") || "").toLowerCase();
        var subject = (row.getAttribute("data-subject") || "").toLowerCase();
        var professor = (row.getAttribute("data-professor") || "").toLowerCase();
        row.hidden = !(
          title.includes(query) ||
          subject.includes(query) ||
          professor.includes(query)
        );
      });

      var subjectCards = document.querySelectorAll(".subject-card[data-subject]");
      subjectCards.forEach(function (card) {
        var name = (card.getAttribute("data-subject") || "").toLowerCase();
        if (!query) {
          card.classList.remove("search-match", "search-hidden");
          return;
        }
        if (name.includes(query)) {
          card.classList.add("search-match");
          card.classList.remove("search-hidden");
        } else {
          card.classList.remove("search-match");
          card.classList.add("search-hidden");
        }
      });
    });
  }

  /* ---- Delegate login modal ---- */
  var modal = document.getElementById("delegate-modal");
  var submitButton = document.getElementById("delegate-submit-button");
  var closeButton = document.querySelector(".modal-close-button");
  var uploadTrigger = document.getElementById("upload-trigger-button");
  var fileUploadInput = document.getElementById("file-upload-input");

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  var delegateLinks = document.querySelectorAll('a[href="espace-delegue.html"]');
  delegateLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "espace-delegue.html";
    });
  });

  if (submitButton) {
    submitButton.addEventListener("click", function () {
      window.location.href = "espace-delegue.html";
    });
  }

  if (closeButton) closeButton.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---- File upload (main page) ---- */
  if (uploadTrigger && fileUploadInput) {
    uploadTrigger.addEventListener("click", function () {
      fileUploadInput.click();
    });

    var ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
    var MAX_FILE_SIZE = 10 * 1024 * 1024;

    fileUploadInput.addEventListener("change", function () {
      var file = this.files[0];
      if (!file) return;
      var ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
        showToast("Type de fichier non autorise.", "info");
        this.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast("Fichier trop volumineux (max 10 Mo).", "info");
        this.value = "";
        return;
      }
      var safeName = file.name.replace(/[<>"'&]/g, "");
      showToast("Fichier selectionne : " + safeName, "success");
    });
  }

  /* ---- Toast notifications ---- */
  var toast = document.getElementById("toast");

  function showToast(message, tone) {
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute("data-tone", tone || "info");
    toast.classList.add("visible");
    setTimeout(function () {
      toast.classList.remove("visible");
    }, 3000);
  }

  /* ---- Help button ---- */
  var helpButton = document.getElementById("help-contact-button");
  if (helpButton) {
    helpButton.addEventListener("click", function () {
      showToast("Veuillez contacter le delegue par e-mail.", "info");
    });
  }
})();

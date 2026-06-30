/**
 * SHARED-COMPONENTS.JS
 * Reusable UI component generators for the Portail des Cours platform.
 * Eliminates HTML duplication between dashboard.html and espace-delegue.html.
 * Uses PortailUtils (src/utils.js) for validation, sanitization, and filtering.
 */

const SharedComponents = (() => {
  /* ─── Configuration ─── */
  const SUBJECTS = [
    "Programmation",
    "Bases de données",
    "Réseaux",
    "Mathématiques",
    "Algorithmique",
    "Anglais",
    "Statistiques",
  ];

  const DOC_TYPES = ["Cours", "TD", "TP", "Examen", "Corrigé"];

  function getUtils() {
    return typeof require === "function" ? require("./src/utils") : window.PortailUtils;
  }

  /* ─── Sidebar ─── */
  function renderSidebar(container, options = {}) {
    const { logoutType = "link", logoutId = "" } = options;
    const logoutHtml =
      logoutType === "button"
        ? `<button class="side-link danger side-action" id="${logoutId}" type="button">Déconnexion</button>`
        : `<a class="side-link danger" href="#logout">Déconnexion</a>`;

    container.innerHTML = `
      <div class="brand-block">
        <div class="brand-icon">PC</div>
        <div>
          <p class="brand-name">PORTAIL DES COURS</p>
          <p class="brand-class">Licence 1 Informatique</p>
        </div>
      </div>

      <nav class="side-nav" aria-label="Menu latéral">
        <a class="side-link active" href="#dashboard">Tableau de bord</a>
        <a class="side-link" href="#add-document">Ajouter un document</a>
        <a class="side-link" href="#my-documents">Mes documents</a>
        <a class="side-link" href="#subjects">Matières</a>
        <a class="side-link" href="#announcements">Annonces</a>
        <a class="side-link" href="#statistics">Statistiques</a>
        <a class="side-link" href="#settings">Paramètres</a>
        ${logoutHtml}
      </nav>

      <div class="sidebar-card">
        <p class="eyebrow">Auth sécurisée</p>
        <h3>${options.cardTitle || "Admin principal"}</h3>
        <p>${options.cardText || "Un seul délégué gère la publication, la modération et le suivi des téléchargements."}</p>
      </div>
    `;
  }

  /* ─── Topbar ─── */
  function renderTopbar(container, options = {}) {
    const { logoutId = "logout" } = options;
    container.innerHTML = `
      <button class="icon-button mobile-toggle" id="menu-toggle" aria-label="Ouvrir le menu">☰</button>

      <div class="topbar-brand">
        <p class="eyebrow">Licence 1 Informatique</p>
        <h1>PORTAIL DES COURS</h1>
      </div>

      <label class="search-bar" aria-label="Recherche instantanée">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 1 0 4.1 11.56l4.42 4.42 1.41-1.41-4.42-4.42A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"/></svg>
        <input id="search-input" type="search" placeholder="Rechercher un document, une matière, un professeur..." />
      </label>

      <div class="topbar-actions">
        <button class="icon-button notify-button" id="notify-button" aria-label="Notifications">🔔<span class="dot"></span></button>
        <div class="profile-card">
          <div class="profile-photo">AD</div>
          <div>
            <strong>Delphine A.</strong>
            <span>Délégué principal</span>
          </div>
        </div>
        <button class="logout-button" id="${logoutId}" type="button">Déconnexion</button>
      </div>
    `;
  }

  /* ─── Hero Card ─── */
  function renderHeroCard(container) {
    container.innerHTML = `
      <div>
        <p class="section-label">Vue d'ensemble</p>
        <h2>Dashboard du délégué</h2>
        <p class="hero-text">Publiez les documents officiels des professeurs, suivez les téléchargements et gérez les annonces de la promotion depuis un espace unique.</p>

        <div class="hero-actions">
          <button class="primary-button" id="open-upload">Ajouter un document</button>
          <button class="secondary-button" id="open-announcement">Créer une annonce</button>
        </div>

        <div class="hero-chips">
          <span>Recherche instantanée</span>
          <span>Téléversement sécurisé</span>
          <span>Modération simplifiée</span>
        </div>
      </div>

      <div class="hero-metrics">
        <div class="metric-pill">
          <strong>81</strong>
          <span>Documents actifs</span>
        </div>
        <div class="metric-pill accent">
          <strong>1 248</strong>
          <span>Téléchargements</span>
        </div>
        <div class="metric-pill soft">
          <strong>8</strong>
          <span>Matières suivies</span>
        </div>
      </div>
    `;
  }

  /* ─── Stats Grid ─── */
  function renderStatsGrid(container) {
    const stats = [
      { icon: "📄", trend: "+12%", title: "Documents totaux", value: "81", desc: "PDF, DOCX et XLSX disponibles pour les étudiants." },
      { icon: "⬇️", trend: "+18%", title: "Téléchargements", value: "1 248", desc: "Volume cumulé de téléchargements depuis l'ouverture." },
      { icon: "📚", trend: "+4%", title: "Matières suivies", value: "8", desc: "Le niveau unique de la promotion est entièrement couvert." },
      { icon: "👥", trend: "+7%", title: "Étudiants", value: "96", desc: "Audience connectée et active sur la plateforme." },
    ];

    container.innerHTML = stats
      .map(
        (s) => `
      <article class="stat-card">
        <div class="stat-top">
          <span class="stat-icon">${s.icon}</span>
          <span class="trend up">${s.trend}</span>
        </div>
        <h3>${s.title}</h3>
        <strong>${s.value}</strong>
        <p>${s.desc}</p>
      </article>
    `
      )
      .join("");
  }

  /* ─── Document Form ─── */
  function renderDocumentForm(container) {
    const subjectOptions = SUBJECTS.map((s) => `<option>${s}</option>`).join("");
    const typeOptions = DOC_TYPES.map((t) => `<option>${t}</option>`).join("");

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <p class="section-label">Gestion documentaire</p>
          <h3>Ajouter un document</h3>
        </div>
        <span class="badge">Google Drive style</span>
      </div>

      <form class="document-form">
        <div class="form-grid">
          <label>
            <span>Titre du document</span>
            <input type="text" placeholder="Ex: TD2 - Tables relationnelles" />
          </label>
          <label>
            <span>Matière</span>
            <select>${subjectOptions}</select>
          </label>
          <label>
            <span>Nom du professeur</span>
            <input type="text" placeholder="Ex: Pr. Kouamé" />
          </label>
          <label>
            <span>Type de document</span>
            <select>${typeOptions}</select>
          </label>
        </div>

        <label class="description-field">
          <span>Description</span>
          <textarea rows="4" placeholder="Décrivez brièvement le contenu du document..."></textarea>
        </label>

        <div class="dropzone" id="dropzone">
          <input id="file-input" type="file" accept=".pdf,.docx,.xlsx" />
          <div class="dropzone-icon">⬆️</div>
          <h4>Glissez-déposez votre fichier ici ou cliquez pour sélectionner un fichier</h4>
          <p>Formats autorisés: PDF, DOCX, XLSX</p>
          <div class="file-preview" id="file-preview">
            <span>Aucun fichier sélectionné</span>
          </div>
          <div class="upload-progress">
            <div class="upload-progress-bar" id="upload-progress-bar"></div>
          </div>
        </div>

        <button class="primary-button full-width" id="publish-button" type="button">Publier le document</button>
      </form>
    `;
  }

  /* ─── Announcements Panel ─── */
  function renderAnnouncementsPanel(container) {
    container.innerHTML = `
      <div class="panel-header compact">
        <div>
          <p class="section-label">Annonces</p>
          <h3>Publier une annonce</h3>
        </div>
      </div>
      <div class="mini-form">
        <input type="text" placeholder="Titre de l'annonce" />
        <textarea rows="4" placeholder="Message à diffuser aux étudiants"></textarea>
        <div class="inline-row">
          <input type="date" />
          <button class="primary-button" type="button">Publier</button>
        </div>
      </div>
      <div class="announcement-list">
        <article class="announcement-item">
          <strong>Rattrapage de cours</strong>
          <p>La séance de Programmation est décalée à jeudi 14h.</p>
          <span>27/06/2026</span>
        </article>
        <article class="announcement-item">
          <strong>Correction publiée</strong>
          <p>Le corrigé du dernier TD est disponible au téléchargement.</p>
          <span>26/06/2026</span>
        </article>
      </div>
    `;
  }

  /* ─── Activity Panel ─── */
  function renderActivityPanel(container) {
    container.innerHTML = `
      <div class="panel-header compact">
        <div>
          <p class="section-label">Activité récente</p>
          <h3>Flux du jour</h3>
        </div>
      </div>
      <div class="activity-list">
        <div class="activity-item"><span>📄</span><div><strong>TD Python publié</strong><p>Il y a 15 minutes</p></div></div>
        <div class="activity-item"><span>⬇️</span><div><strong>42 téléchargements</strong><p>Au cours de l'après-midi</p></div></div>
        <div class="activity-item"><span>🔔</span><div><strong>Annonce envoyée</strong><p>Rappel sur le TP Réseaux</p></div></div>
      </div>
    `;
  }

  /* ─── Documents Table ─── */
  function renderDocumentsTable(container) {
    const documents = [
      { badge: "pdf", badgeLabel: "PDF", title: "TD1 - Introduction à Python", subject: "Programmation", prof: "Pr. N'Guessan", type: "TD", date: "26/06/2026", downloads: "214", status: "success", statusLabel: "Publié" },
      { badge: "doc", badgeLabel: "DOCX", title: "Cours - Modèle relationnel", subject: "Bases de données", prof: "Pr. Kouamé", type: "Cours", date: "25/06/2026", downloads: "153", status: "pending", statusLabel: "Révision" },
      { badge: "xls", badgeLabel: "XLSX", title: "Exercices - Séries statistiques", subject: "Statistiques", prof: "Pr. Akissi", type: "TP", date: "24/06/2026", downloads: "98", status: "success", statusLabel: "Publié" },
    ];

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <p class="section-label">Gestion des fichiers</p>
          <h3>Documents publiés</h3>
        </div>
        <div class="filter-group">
          <button class="chip active" type="button">Tous</button>
          <button class="chip" type="button">PDF</button>
          <button class="chip" type="button">DOCX</button>
          <button class="chip" type="button">XLSX</button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Nom du document</th>
              <th>Matière</th>
              <th>Professeur</th>
              <th>Type</th>
              <th>Date</th>
              <th>Téléchargements</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${documents
              .map(
                (d) => `
              <tr data-document data-file-type="${d.badge}" data-title="${d.title}" data-subject="${d.subject}" data-professor="${d.prof}">
                <td><span class="file-badge ${d.badge}">${d.badgeLabel}</span></td>
                <td>${d.title}</td>
                <td>${d.subject}</td>
                <td>${d.prof}</td>
                <td>${d.type}</td>
                <td>${d.date}</td>
                <td>${d.downloads}</td>
                <td><span class="status ${d.status}">${d.statusLabel}</span></td>
                <td>
                  <button>Voir</button>
                  <button>Modifier</button>
                  <button>Supprimer</button>
                  <button>Télécharger</button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ─── Statistics Panel ─── */
  function renderStatisticsPanel(container) {
    container.innerHTML = `
      <div class="panel-header">
        <div>
          <p class="section-label">Statistiques</p>
          <h3>Performance de la plateforme</h3>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <strong>Évolution mensuelle des téléchargements</strong>
          <span>Jan - Juin 2026</span>
        </div>
        <div class="bars-chart" aria-label="Graphique des téléchargements">
          <div class="bar"><span style="height: 28%"></span><small>Jan</small></div>
          <div class="bar"><span style="height: 38%"></span><small>Fév</small></div>
          <div class="bar"><span style="height: 45%"></span><small>Mar</small></div>
          <div class="bar"><span style="height: 52%"></span><small>Avr</small></div>
          <div class="bar"><span style="height: 66%"></span><small>Mai</small></div>
          <div class="bar active"><span style="height: 82%"></span><small>Juin</small></div>
        </div>
      </div>

      <div class="mini-stats-grid">
        <div class="mini-stat">
          <p>Documents les plus téléchargés</p>
          <strong>TD1 - Python</strong>
          <span>214 téléchargements</span>
        </div>
        <div class="mini-stat">
          <p>Matières les plus consultées</p>
          <strong>Programmation</strong>
          <span>41% du trafic</span>
        </div>
      </div>
    `;
  }

  /* ─── Subjects Grid ─── */
  function renderSubjectsGrid(container) {
    const allSubjects = [...SUBJECTS, "Autres"];
    container.innerHTML = `
      <div class="panel-header">
        <div>
          <p class="section-label">Matières</p>
          <h3>Filtres rapides par matière</h3>
        </div>
      </div>
      <div class="subject-grid">
        ${allSubjects
          .map(
            (s, i) =>
              `<button class="subject-card-btn${i === 0 ? " active" : ""}">${s}</button>`
          )
          .join("")}
      </div>
    `;
  }

  /* ─── Settings Grid ─── */
  function renderSettingsGrid(container) {
    const settings = [
      { title: "Connexion sécurisée", desc: "Session protégée pour le délégué unique." },
      { title: "Notifications", desc: "Alertes activées pour les nouveaux téléchargements." },
      { title: "Filtre instantané", desc: "Recherche par titre, professeur ou matière." },
    ];

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <p class="section-label">Paramètres</p>
          <h3>Authentification et sécurité</h3>
        </div>
      </div>
      <div class="settings-grid">
        ${settings
          .map(
            (s) => `
          <div class="setting-item">
            <strong>${s.title}</strong>
            <p>${s.desc}</p>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  /* ─── Notification Toast Utility ─── */
  function showNotification(message, tone, duration) {
    duration = duration || 3000;
    tone = tone || "info";
    var el = document.querySelector(".notification");
    if (!el) {
      el = document.createElement("div");
      el.className = "notification";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.setAttribute("data-tone", tone);
    el.classList.add("visible");
    setTimeout(function () { el.classList.remove("visible"); }, duration);
  }

  /* ─── Mobile Menu Toggle Utility ─── */
  function initMobileMenu(toggleId, sidebarId) {
    toggleId = toggleId || "menu-toggle";
    sidebarId = sidebarId || "sidebar";
    var toggle = document.getElementById(toggleId);
    var sidebar = document.getElementById(sidebarId);
    if (toggle && sidebar) {
      toggle.addEventListener("click", function () { sidebar.classList.toggle("open"); });
    }
  }

  /* ─── Dropzone Utility (uses PortailUtils for validation) ─── */
  function initDropzone(dropzoneId, fileInputId, previewId, progressBarId) {
    dropzoneId = dropzoneId || "dropzone";
    fileInputId = fileInputId || "file-input";
    previewId = previewId || "file-preview";
    progressBarId = progressBarId || "upload-progress-bar";

    var utils = getUtils();
    var dropzone = document.getElementById(dropzoneId);
    var fileInput = document.getElementById(fileInputId);
    var preview = document.getElementById(previewId);
    var progressBar = document.getElementById(progressBarId);

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", function () { fileInput.click(); });

    dropzone.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", function () {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    function handleFile(file) {
      if (utils && utils.isAllowedFileType && !utils.isAllowedFileType(file.name)) {
        showNotification("Type de fichier non autorisé.", "error");
        return;
      }
      if (preview) {
        var size = utils && utils.formatFileSize ? utils.formatFileSize(file.size) : (file.size / 1024).toFixed(1) + " Ko";
        var name = utils && utils.sanitizeInput ? utils.sanitizeInput(file.name) : file.name;
        preview.innerHTML = "<span>" + name + " (" + size + ")</span>";
      }
      simulateProgress();
    }

    function simulateProgress() {
      if (!progressBar) return;
      var width = 0;
      progressBar.style.width = "0%";
      var interval = setInterval(function () {
        width += 10;
        progressBar.style.width = width + "%";
        if (width >= 100) {
          clearInterval(interval);
          showNotification("Fichier prêt à publier.", "success");
        }
      }, 120);
    }
  }

  /* ─── Search Utility (uses PortailUtils for normalization + debounce) ─── */
  function initSearch() {
    var utils = getUtils();
    var input = document.getElementById("search-input");
    if (!input) return;

    var tbody = document.querySelector(".table-wrap tbody");
    if (!tbody) return;

    var allRows = Array.from(tbody.querySelectorAll("tr"));

    var filterFn = function () {
      var query = utils && utils.normalizeText ? utils.normalizeText(input.value) : input.value.toLowerCase().trim();
      allRows.forEach(function (row) {
        if (!query) { row.style.display = ""; return; }
        var text = utils && utils.normalizeText ? utils.normalizeText(row.textContent || "") : (row.textContent || "").toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
      });
    };

    var debouncedFilter = utils && utils.debounce ? utils.debounce(filterFn, 250) : filterFn;
    input.addEventListener("input", debouncedFilter);
  }

  /* ─── Filter Chips Utility ─── */
  function initFilterChips() {
    var chips = document.querySelectorAll(".filter-group .chip");
    var tbody = document.querySelector(".table-wrap tbody");
    if (!chips.length || !tbody) return;

    var allRows = Array.from(tbody.querySelectorAll("tr"));

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");

        var filterType = chip.textContent.trim().toLowerCase();
        allRows.forEach(function (row) {
          if (filterType === "tous") { row.style.display = ""; return; }
          var badge = row.querySelector(".file-badge");
          if (!badge) { row.style.display = "none"; return; }
          var badgeType = badge.textContent.trim().toLowerCase();
          row.style.display = badgeType === filterType ? "" : "none";
        });
      });
    });
  }

  /* ─── Publish Button Utility (uses PortailUtils for validation) ─── */
  function initPublishButton() {
    var utils = getUtils();
    var publishBtn = document.getElementById("publish-button");
    if (!publishBtn) return;

    publishBtn.addEventListener("click", function () {
      var form = document.querySelector(".document-form");
      if (!form) return;

      var titleInput = form.querySelector('input[type="text"]');
      var profInput = form.querySelectorAll('input[type="text"]')[1];
      var subjectSelect = form.querySelector("select");
      var fileInput = document.getElementById("file-input");

      var data = {
        title: titleInput ? titleInput.value : "",
        subject: subjectSelect ? subjectSelect.value : "",
        professor: profInput ? profInput.value : "",
        file: fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null,
      };

      if (utils && utils.validateDocumentForm) {
        var result = utils.validateDocumentForm(data);
        if (!result.valid) {
          showNotification(result.errors[0], "error");
          return;
        }
      }

      var title = utils && utils.sanitizeInput ? utils.sanitizeInput(data.title) : data.title;
      showNotification('Document "' + title + '" publié avec succès !', "success");
    });
  }

  /* ─── Notify Button ─── */
  function initNotifyButton() {
    var notifyBtn = document.getElementById("notify-button");
    if (!notifyBtn) return;
    notifyBtn.addEventListener("click", function () {
      showNotification("Aucune nouvelle notification.", "info");
    });
  }

  /* ─── Scroll-to Buttons ─── */
  function initScrollButtons() {
    var openUpload = document.getElementById("open-upload");
    if (openUpload) {
      openUpload.addEventListener("click", function () {
        var target = document.getElementById("add-document");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }
    var openAnnouncement = document.getElementById("open-announcement");
    if (openAnnouncement) {
      openAnnouncement.addEventListener("click", function () {
        var target = document.getElementById("announcements");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  /* ─── Public API ─── */
  return {
    SUBJECTS: SUBJECTS,
    DOC_TYPES: DOC_TYPES,
    renderSidebar: renderSidebar,
    renderTopbar: renderTopbar,
    renderHeroCard: renderHeroCard,
    renderStatsGrid: renderStatsGrid,
    renderDocumentForm: renderDocumentForm,
    renderAnnouncementsPanel: renderAnnouncementsPanel,
    renderActivityPanel: renderActivityPanel,
    renderDocumentsTable: renderDocumentsTable,
    renderStatisticsPanel: renderStatisticsPanel,
    renderSubjectsGrid: renderSubjectsGrid,
    renderSettingsGrid: renderSettingsGrid,
    showNotification: showNotification,
    initMobileMenu: initMobileMenu,
    initDropzone: initDropzone,
    initSearch: initSearch,
    initFilterChips: initFilterChips,
    initPublishButton: initPublishButton,
    initNotifyButton: initNotifyButton,
    initScrollButtons: initScrollButtons,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SharedComponents;
}

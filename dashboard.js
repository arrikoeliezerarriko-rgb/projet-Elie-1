(function () {
  'use strict';

  /**
   * DASHBOARD.JS — Uses SharedComponents (when available) to render the
   * dashboard page, then wires up interactive behaviors via shared utilities.
   * Falls back to attaching behaviors directly when DOM is pre-rendered (tests).
   */
  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  function renderComponents() {
    var SC = typeof SharedComponents !== 'undefined' ? SharedComponents : null;
    if (!SC) return;
    var sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.hasChildNodes()) {
      SC.renderSidebar(sidebar);
      SC.renderTopbar(document.getElementById('topbar'), { logoutId: 'logout' });
      SC.renderHeroCard(document.getElementById('dashboard'));
      SC.renderStatsGrid(document.getElementById('stats-grid'));
      SC.renderDocumentForm(document.getElementById('add-document'));
      SC.renderAnnouncementsPanel(document.getElementById('announcements'));
      SC.renderActivityPanel(document.getElementById('activity-panel'));
      SC.renderDocumentsTable(document.getElementById('my-documents'));
      SC.renderStatisticsPanel(document.getElementById('statistics'));
      SC.renderSubjectsGrid(document.getElementById('subjects'));
      SC.renderSettingsGrid(document.getElementById('settings'));
    }
  }

  function initSidebar() {
    var toggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  function initSearch() {
    var input = document.getElementById('search-input');
    if (!input) return;

    var tbody = document.querySelector('.table-wrap tbody');
    if (!tbody) return;

    var allRows = Array.from(tbody.querySelectorAll('tr'));

    var debouncedFilter = utils.debounce(function () {
      var query = utils.normalizeText(input.value);
      allRows.forEach(function (row) {
        if (!query) {
          row.style.display = '';
          return;
        }
        var text = utils.normalizeText(row.textContent || '');
        row.style.display = text.includes(query) ? '' : 'none';
      });
    }, 250);

    input.addEventListener('input', debouncedFilter);
  }

  function initDropzone() {
    var dropzone = document.getElementById('dropzone');
    var fileInput = document.getElementById('file-input');
    var preview = document.getElementById('file-preview');
    var progressBar = document.getElementById('upload-progress-bar');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', function () {
      fileInput.click();
    });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    function handleFile(file) {
      if (!utils.isAllowedFileType(file.name)) {
        showToast('Type de fichier non autorisé.', 'error');
        return;
      }
      if (preview) {
        preview.innerHTML =
          '<span>' + utils.sanitizeInput(file.name) + ' (' + utils.formatFileSize(file.size) + ')</span>';
      }
      simulateProgress();
    }

    function simulateProgress() {
      if (!progressBar) return;
      var width = 0;
      progressBar.style.width = '0%';
      var interval = setInterval(function () {
        width += 10;
        progressBar.style.width = width + '%';
        if (width >= 100) {
          clearInterval(interval);
          showToast('Fichier prêt à publier.', 'success');
        }
      }, 120);
    }
  }

  function initFilterChips() {
    var chips = document.querySelectorAll('.filter-group .chip');
    var tbody = document.querySelector('.table-wrap tbody');
    if (!chips.length || !tbody) return;

    var allRows = Array.from(tbody.querySelectorAll('tr'));

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');

        var filterType = chip.textContent.trim().toLowerCase();

        allRows.forEach(function (row) {
          if (filterType === 'tous') {
            row.style.display = '';
            return;
          }
          var badge = row.querySelector('.file-badge');
          if (!badge) { row.style.display = 'none'; return; }
          var badgeType = badge.textContent.trim().toLowerCase();
          row.style.display = badgeType === filterType ? '' : 'none';
        });
      });
    });
  }

  function initPublishButton() {
    var publishBtn = document.getElementById('publish-button');
    if (!publishBtn) return;

    publishBtn.addEventListener('click', function () {
      var form = document.querySelector('.document-form');
      if (!form) return;

      var titleInput = form.querySelector('input[type="text"]');
      var profInput = form.querySelectorAll('input[type="text"]')[1];
      var subjectSelect = form.querySelector('select');
      var fileInput = document.getElementById('file-input');

      var data = {
        title: titleInput ? titleInput.value : '',
        subject: subjectSelect ? subjectSelect.value : '',
        professor: profInput ? profInput.value : '',
        file: fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null,
      };

      var result = utils.validateDocumentForm(data);
      if (!result.valid) {
        showToast(result.errors[0], 'error');
        return;
      }

      showToast('Document "' + utils.sanitizeInput(data.title) + '" publié avec succès !', 'success');
    });
  }

  function initLogout() {
    var logoutBtn = document.getElementById('logout');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', function () {
      showToast('Déconnexion réussie.', 'success');
      setTimeout(function () { window.location.href = 'index.html'; }, 1200);
    });
  }

  function initNotifyButton() {
    var notifyBtn = document.getElementById('notify-button');
    if (!notifyBtn) return;
    notifyBtn.addEventListener('click', function () {
      showToast('Aucune nouvelle notification.', 'info');
    });
  }

  function initScrollButtons() {
    var openUpload = document.getElementById('open-upload');
    if (openUpload) {
      openUpload.addEventListener('click', function () {
        var target = document.getElementById('add-document');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
    var openAnnouncement = document.getElementById('open-announcement');
    if (openAnnouncement) {
      openAnnouncement.addEventListener('click', function () {
        var target = document.getElementById('announcements');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function showToast(message, type) {
    var existing = document.querySelector('.toast');
    var toast = existing || document.createElement('div');
    if (!existing) {
      toast.className = 'toast';
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info') + ' show';
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3000);
  }

  function init() {
    renderComponents();
    initSidebar();
    initSearch();
    initDropzone();
    initFilterChips();
    initPublishButton();
    initLogout();
    initNotifyButton();
    initScrollButtons();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      initSidebar: initSidebar,
      initSearch: initSearch,
      initDropzone: initDropzone,
      initFilterChips: initFilterChips,
      initPublishButton: initPublishButton,
      initLogout: initLogout,
      showToast: showToast,
      init: init,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

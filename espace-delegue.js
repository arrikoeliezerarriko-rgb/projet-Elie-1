(function () {
  'use strict';

  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  var CREDENTIALS = { username: 'delegue', password: 'admin1234' };

  function initAuth() {
    var authForm = document.getElementById('auth-form');
    var authScreen = document.getElementById('auth-screen');
    var delegateLayout = document.getElementById('delegate-layout');
    if (!authForm) return;

    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var usernameInput = document.getElementById('auth-username');
      var passwordInput = document.getElementById('auth-password');
      var username = usernameInput ? usernameInput.value : '';
      var password = passwordInput ? passwordInput.value : '';

      var result = utils.validateLoginForm(username, password);
      if (!result.valid) {
        showAuthError(result.errors[0]);
        return;
      }

      if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        if (authScreen) authScreen.hidden = true;
        if (delegateLayout) delegateLayout.hidden = false;
        initDashboard();
      } else {
        showAuthError('Identifiant ou mot de passe incorrect.');
      }
    });
  }

  function showAuthError(message) {
    var existing = document.querySelector('.auth-error');
    if (existing) existing.remove();
    var authForm = document.getElementById('auth-form');
    if (!authForm) return;
    var errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    authForm.insertBefore(errorDiv, authForm.firstChild);
  }

  function initLogout() {
    var sideLogout = document.getElementById('side-logout');
    var topLogout = document.getElementById('top-logout');
    var authScreen = document.getElementById('auth-screen');
    var delegateLayout = document.getElementById('delegate-layout');

    function logout() {
      if (delegateLayout) delegateLayout.hidden = true;
      if (authScreen) authScreen.hidden = false;
      var usernameInput = document.getElementById('auth-username');
      var passwordInput = document.getElementById('auth-password');
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      var existing = document.querySelector('.auth-error');
      if (existing) existing.remove();
    }

    if (sideLogout) sideLogout.addEventListener('click', logout);
    if (topLogout) topLogout.addEventListener('click', logout);
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
        if (!query) { row.style.display = ''; return; }
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

    dropzone.addEventListener('click', function () { fileInput.click(); });

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
        if (width >= 100) clearInterval(interval);
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
          if (filterType === 'tous') { row.style.display = ''; return; }
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

      showToast('Document publié avec succès !', 'success');
    });
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
    }, 3500);
  }

  function initDashboard() {
    initSidebar();
    initSearch();
    initDropzone();
    initFilterChips();
    initPublishButton();
  }

  function init() {
    initAuth();
    initLogout();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      CREDENTIALS: CREDENTIALS,
      initAuth: initAuth,
      initLogout: initLogout,
      initSidebar: initSidebar,
      initSearch: initSearch,
      initDropzone: initDropzone,
      initFilterChips: initFilterChips,
      initPublishButton: initPublishButton,
      showAuthError: showAuthError,
      showToast: showToast,
      initDashboard: initDashboard,
      init: init,
    };
  }
})();

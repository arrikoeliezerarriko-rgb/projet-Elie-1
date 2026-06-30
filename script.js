(function () {
  'use strict';

  /**
   * SCRIPT.JS — Main portal (index.html) interactions.
   * Uses PortailUtils for search/filtering, validation, and sanitization.
   */
  var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;

  function initMobileMenu() {
    var menuButton = document.querySelector('.mobile-menu-button');
    var sidebar = document.querySelector('.sidebar');
    if (!menuButton || !sidebar) return;

    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      sidebar.classList.toggle('open');
    });
  }

  function initSearch() {
    var searchInput = document.getElementById('document-search');
    if (!searchInput) return;

    var tbody = document.querySelector('.table-card tbody');
    if (!tbody) return;

    var allRows = Array.from(tbody.querySelectorAll('tr[data-document]'));
    var documents = utils.parseDocumentRows(tbody);

    var debouncedFilter = utils.debounce(function () {
      var query = searchInput.value;
      var filtered = utils.filterDocuments(documents, query);
      var filteredTitles = filtered.map(function (d) { return d.title; });
      allRows.forEach(function (row) {
        var title = row.getAttribute('data-title') || '';
        row.style.display = filteredTitles.includes(title) ? '' : 'none';
      });
      filterSubjectCards(query);
    }, 250);

    searchInput.addEventListener('input', debouncedFilter);
  }

  function filterSubjectCards(query) {
    var cards = document.querySelectorAll('.subject-card');
    cards.forEach(function (card) {
      if (!query || query.trim() === '') {
        card.classList.remove('search-match', 'search-hidden');
        return;
      }
      var subject = card.getAttribute('data-subject') || '';
      var normalizedQuery = utils.normalizeText(query);
      if (utils.normalizeText(subject).includes(normalizedQuery)) {
        card.classList.add('search-match');
        card.classList.remove('search-hidden');
      } else {
        card.classList.remove('search-match');
        card.classList.add('search-hidden');
      }
    });
  }

  function initDelegateModal() {
    var modal = document.getElementById('delegate-modal');
    if (!modal) return;

    var closeBtn = modal.querySelector('.modal-close-button');
    var submitBtn = document.getElementById('delegate-submit-button');
    var helpBtn = document.getElementById('help-contact-button');
    var delegateLinks = document.querySelectorAll('a[href="espace-delegue.html"]');

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('visible');
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('visible');
    }

    if (helpBtn) helpBtn.addEventListener('click', openModal);

    delegateLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var emailInput = modal.querySelector('input[type="email"]');
        var passwordInput = modal.querySelector('input[type="password"]');
        var email = emailInput ? emailInput.value : '';
        var password = passwordInput ? passwordInput.value : '';

        if (!utils.validateEmail(email)) {
          showToast('Veuillez saisir une adresse e-mail valide.', 'error');
          return;
        }
        var result = utils.validateLoginForm(email, password);
        if (!result.valid) {
          showToast(result.errors[0], 'error');
          return;
        }

        showToast('Connexion simulée avec succès !', 'success');
        closeModal();
        setTimeout(function () { window.location.href = 'espace-delegue.html'; }, 1000);
      });
    }
  }

  function initUploadTrigger() {
    var uploadBtn = document.getElementById('upload-trigger-button');
    var fileInput = document.getElementById('file-upload-input');
    if (!uploadBtn || !fileInput) return;

    uploadBtn.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      if (!fileInput.files || fileInput.files.length === 0) return;
      var file = fileInput.files[0];
      if (!utils.isAllowedFileType(file.name)) {
        showToast('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, XLS, XLSX.', 'error');
        fileInput.value = '';
        return;
      }
      showToast('Fichier "' + utils.sanitizeInput(file.name) + '" sélectionné (' + utils.formatFileSize(file.size) + ').', 'success');
    });
  }

  function initHelpButton() {
    var helpBtn = document.getElementById('help-contact-button');
    if (helpBtn) {
      helpBtn.addEventListener('click', function () {
        showToast('Un message a été envoyé au délégué.', 'success');
      });
    }
  }

  function initNotifications() {
    var notifBtn = document.querySelector('.notification-button');
    if (!notifBtn) return;
    notifBtn.addEventListener('click', function () {
      showToast('Aucune nouvelle notification.', 'info');
    });
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'info') + ' show';
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3500);
  }

  function init() {
    initMobileMenu();
    initSearch();
    initDelegateModal();
    initUploadTrigger();
    initHelpButton();
    initNotifications();
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
      initMobileMenu: initMobileMenu,
      initSearch: initSearch,
      initModal: initDelegateModal,
      initFileUpload: initUploadTrigger,
      initNotifications: initNotifications,
      showToast: showToast,
      init: init,
    };
  }
})();

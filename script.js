(function () {
  'use strict';

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
    }, 250);

    searchInput.addEventListener('input', debouncedFilter);
  }

  function initModal() {
    var modal = document.getElementById('delegate-modal');
    if (!modal) return;

    var closeBtn = modal.querySelector('.modal-close-button');
    var helpBtn = document.getElementById('help-contact-button');

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('visible');
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('visible');
    }

    if (helpBtn) helpBtn.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
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

  function initNotifications() {
    var notifBtn = document.querySelector('.notification-button');
    if (!notifBtn) return;
    notifBtn.addEventListener('click', function () {
      showToast('Aucune nouvelle notification.', 'info');
    });
  }

  function init() {
    initMobileMenu();
    initSearch();
    initModal();
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
      initModal: initModal,
      initNotifications: initNotifications,
      showToast: showToast,
      init: init,
    };
  }
})();

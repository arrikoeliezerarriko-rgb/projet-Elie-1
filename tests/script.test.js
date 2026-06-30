/**
 * @jest-environment jsdom
 */

let scriptModule;

function loadScript() {
  jest.resetModules();
  scriptModule = require('../script');
}

function setUpIndexHTML() {
  document.body.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar"></aside>
      <div class="main-area">
        <header class="topbar">
          <button class="icon-button mobile-menu-button" aria-label="Ouvrir le menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <label class="search-bar">
            <input id="document-search" type="search" placeholder="Rechercher..." />
          </label>
          <button class="icon-button notification-button" aria-label="Notifications">
            <span class="notification-dot"></span>
          </button>
        </header>

        <main>
          <div class="table-card">
            <table>
              <tbody>
                <tr data-document data-file-type="pdf" data-title="TD1 - Python" data-subject="Programmation" data-professor="Pr. N'Guessan">
                  <td>TD1 - Python</td>
                </tr>
                <tr data-document data-file-type="doc" data-title="Cours - Modèle relationnel" data-subject="Bases de données" data-professor="Pr. Kouamé">
                  <td>Cours - Modèle relationnel</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>

        <div class="modal-overlay" id="delegate-modal" aria-hidden="true">
          <div class="modal-card" role="dialog">
            <div class="modal-header">
              <button class="icon-button modal-close-button" type="button">×</button>
            </div>
            <div class="contact-info">
              <p><strong>Délégué principal :</strong> Delphine A.</p>
              <p>Pour toute demande, contactez le délégué via l'espace sécurisé.</p>
              <a class="primary-button full-width" href="espace-delegue.html">Accéder à l'espace délégué</a>
            </div>
          </div>
        </div>

        <div class="toast" id="toast" aria-live="polite"></div>
        <button class="primary-button" id="help-contact-button">Contacter le délégué</button>
      </div>
    </div>
  `;
}

beforeEach(() => {
  jest.useFakeTimers();
  setUpIndexHTML();
  loadScript();
});

afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------
describe('initMobileMenu', () => {
  test('toggles sidebar open class and aria-expanded', () => {
    const btn = document.querySelector('.mobile-menu-button');
    const sidebar = document.querySelector('.sidebar');

    btn.click();
    expect(sidebar.classList.contains('open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    btn.click();
    expect(sidebar.classList.contains('open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('does nothing when elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => {
      loadScript();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
describe('initSearch', () => {
  test('filters document rows by query', () => {
    const searchInput = document.getElementById('document-search');
    const rows = document.querySelectorAll('tr[data-document]');

    searchInput.value = 'Python';
    searchInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
  });

  test('shows all rows when query is cleared', () => {
    const searchInput = document.getElementById('document-search');
    const rows = document.querySelectorAll('tr[data-document]');

    searchInput.value = 'Python';
    searchInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
describe('initModal', () => {
  test('opens modal when help button is clicked', () => {
    const modal = document.getElementById('delegate-modal');
    const helpBtn = document.getElementById('help-contact-button');

    helpBtn.click();
    expect(modal.getAttribute('aria-hidden')).toBe('false');
    expect(modal.classList.contains('visible')).toBe(true);
  });

  test('closes modal when close button is clicked', () => {
    const modal = document.getElementById('delegate-modal');
    const helpBtn = document.getElementById('help-contact-button');
    const closeBtn = modal.querySelector('.modal-close-button');

    helpBtn.click();
    expect(modal.classList.contains('visible')).toBe(true);

    closeBtn.click();
    expect(modal.getAttribute('aria-hidden')).toBe('true');
    expect(modal.classList.contains('visible')).toBe(false);
  });

  test('closes modal when clicking overlay', () => {
    const modal = document.getElementById('delegate-modal');
    const helpBtn = document.getElementById('help-contact-button');

    helpBtn.click();
    modal.click();
    expect(modal.getAttribute('aria-hidden')).toBe('true');
  });

  test('prevents closing when clicking inside modal card', () => {
    const modal = document.getElementById('delegate-modal');
    const helpBtn = document.getElementById('help-contact-button');
    const card = modal.querySelector('.modal-card');

    helpBtn.click();
    card.click();
    expect(modal.getAttribute('aria-hidden')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
describe('showToast', () => {
  test('displays message in toast', () => {
    const toast = document.getElementById('toast');
    scriptModule.showToast('Test message', 'info');
    expect(toast.textContent).toBe('Test message');
    expect(toast.classList.contains('show')).toBe(true);
    expect(toast.classList.contains('info')).toBe(true);
  });

  test('hides toast after timeout', () => {
    const toast = document.getElementById('toast');
    scriptModule.showToast('Fading...', 'success');
    expect(toast.classList.contains('show')).toBe(true);
    jest.advanceTimersByTime(3600);
    expect(toast.classList.contains('show')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
describe('initNotifications', () => {
  test('shows info toast when notification button is clicked', () => {
    const btn = document.querySelector('.notification-button');
    const toast = document.getElementById('toast');

    btn.click();
    expect(toast.textContent).toMatch(/notification/i);
  });
});

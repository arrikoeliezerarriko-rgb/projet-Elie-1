/**
 * @jest-environment jsdom
 */

let espaceModule;

function loadEspace() {
  jest.resetModules();
  espaceModule = require('../espace-delegue');
}

function setUpEspaceDelegueHTML() {
  document.body.innerHTML = `
    <div class="auth-screen" id="auth-screen">
      <div class="auth-card">
        <form class="auth-form" id="auth-form">
          <label><input id="auth-username" type="text" placeholder="delegue" /></label>
          <label><input id="auth-password" type="password" placeholder="Mot de passe" /></label>
          <button class="primary-button" type="submit">Entrer</button>
        </form>
      </div>
    </div>

    <div class="layout" id="delegate-layout" hidden>
      <aside class="sidebar" id="sidebar">
        <nav class="side-nav">
          <button class="side-link danger side-action" id="side-logout" type="button">Déconnexion</button>
        </nav>
      </aside>

      <div class="main">
        <header class="topbar">
          <button class="icon-button mobile-toggle" id="menu-toggle">☰</button>
          <label class="search-bar">
            <input id="search-input" type="search" placeholder="Rechercher..." />
          </label>
          <button class="icon-button notify-button" id="notify-button">🔔</button>
          <button class="logout-button" id="top-logout" type="button">Déconnexion</button>
        </header>

        <main class="content">
          <form class="document-form">
            <div class="form-grid">
              <label><input type="text" placeholder="Titre" /></label>
              <label><select><option>Programmation</option></select></label>
              <label><input type="text" placeholder="Professeur" /></label>
              <label><select><option>Cours</option></select></label>
            </div>
            <div class="dropzone" id="dropzone">
              <input id="file-input" type="file" accept=".pdf,.docx,.xlsx" />
              <div class="file-preview" id="file-preview"><span>Aucun fichier</span></div>
              <div class="upload-progress"><div class="upload-progress-bar" id="upload-progress-bar"></div></div>
            </div>
            <button class="primary-button" id="publish-button" type="button">Publier</button>
          </form>

          <div class="filter-group">
            <button class="chip active" type="button">Tous</button>
            <button class="chip" type="button">PDF</button>
            <button class="chip" type="button">DOCX</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Nom</th></tr></thead>
              <tbody>
                <tr><td><span class="file-badge pdf">PDF</span></td><td>TD1</td></tr>
                <tr><td><span class="file-badge doc">DOCX</span></td><td>Cours</td></tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  `;
}

beforeEach(() => {
  jest.useFakeTimers();
  setUpEspaceDelegueHTML();
  loadEspace();
});

afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
describe('initAuth', () => {
  test('shows error for empty credentials', () => {
    const form = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    usernameInput.value = '';
    passwordInput.value = '';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toMatch(/requis/i);
  });

  test('shows error for wrong credentials', () => {
    const form = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    usernameInput.value = 'wrong';
    passwordInput.value = 'wrong123';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toMatch(/incorrect/i);
  });

  test('reveals delegate layout for correct credentials', () => {
    const form = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const authScreen = document.getElementById('auth-screen');
    const layout = document.getElementById('delegate-layout');

    usernameInput.value = 'delegue';
    passwordInput.value = 'admin1234';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(authScreen.hidden).toBe(true);
    expect(layout.hidden).toBe(false);
  });

  test('shows error for short password', () => {
    const form = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    usernameInput.value = 'delegue';
    passwordInput.value = 'ab';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toMatch(/4 caractères/i);
  });

  test('replaces old error message on new attempt', () => {
    const form = document.getElementById('auth-form');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    usernameInput.value = '';
    passwordInput.value = '';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    usernameInput.value = 'wrong';
    passwordInput.value = 'wrong123';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const errors = document.querySelectorAll('.auth-error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toMatch(/incorrect/i);
  });
});

// ---------------------------------------------------------------------------
// showAuthError
// ---------------------------------------------------------------------------
describe('showAuthError', () => {
  test('inserts an error div into auth-form', () => {
    espaceModule.showAuthError('Test error');
    const error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toBe('Test error');
    expect(error.getAttribute('role')).toBe('alert');
  });

  test('replaces previous error', () => {
    espaceModule.showAuthError('First');
    espaceModule.showAuthError('Second');
    const errors = document.querySelectorAll('.auth-error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toBe('Second');
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
describe('initLogout', () => {
  function login() {
    const form = document.getElementById('auth-form');
    document.getElementById('auth-username').value = 'delegue';
    document.getElementById('auth-password').value = 'admin1234';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  test('side-logout hides layout and shows auth screen', () => {
    login();
    const sideLogout = document.getElementById('side-logout');
    const authScreen = document.getElementById('auth-screen');
    const layout = document.getElementById('delegate-layout');

    sideLogout.click();

    expect(layout.hidden).toBe(true);
    expect(authScreen.hidden).toBe(false);
  });

  test('top-logout hides layout and shows auth screen', () => {
    login();
    const topLogout = document.getElementById('top-logout');
    const authScreen = document.getElementById('auth-screen');
    const layout = document.getElementById('delegate-layout');

    topLogout.click();

    expect(layout.hidden).toBe(true);
    expect(authScreen.hidden).toBe(false);
  });

  test('clears form inputs on logout', () => {
    login();
    const sideLogout = document.getElementById('side-logout');
    sideLogout.click();

    expect(document.getElementById('auth-username').value).toBe('');
    expect(document.getElementById('auth-password').value).toBe('');
  });

  test('removes auth-error on logout', () => {
    espaceModule.showAuthError('Some error');
    document.getElementById('side-logout').click();

    expect(document.querySelector('.auth-error')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
describe('initSidebar', () => {
  test('toggles sidebar open class', () => {
    espaceModule.initSidebar();
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle.click();
    expect(sidebar.classList.contains('open')).toBe(true);
    toggle.click();
    expect(sidebar.classList.contains('open')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
describe('initSearch', () => {
  test('filters table rows by text content', () => {
    espaceModule.initSearch();
    const input = document.getElementById('search-input');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    input.value = 'TD1';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
  });

  test('shows all when query is empty', () => {
    espaceModule.initSearch();
    const input = document.getElementById('search-input');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    input.value = 'TD1';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    rows.forEach((row) => {
      expect(row.style.display).toBe('');
    });
  });
});

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------
describe('initDropzone', () => {
  test('handles dragover and dragleave classes', () => {
    espaceModule.initDropzone();
    const dropzone = document.getElementById('dropzone');

    const dragoverEvent = new Event('dragover', { bubbles: true });
    dragoverEvent.preventDefault = jest.fn();
    dropzone.dispatchEvent(dragoverEvent);
    expect(dropzone.classList.contains('dragover')).toBe(true);

    dropzone.dispatchEvent(new Event('dragleave'));
    expect(dropzone.classList.contains('dragover')).toBe(false);
  });

  test('updates file preview for valid file', () => {
    espaceModule.initDropzone();
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('file-preview');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'test.docx', size: 2048 }],
      writable: false,
    });
    fileInput.dispatchEvent(new Event('change'));

    expect(preview.textContent).toMatch(/test\.docx/);
  });

  test('rejects disallowed file type', () => {
    espaceModule.initDropzone();
    const fileInput = document.getElementById('file-input');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'image.jpg', size: 2048 }],
      writable: false,
    });
    fileInput.dispatchEvent(new Event('change'));

    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toMatch(/non autorisé/i);
  });
});

// ---------------------------------------------------------------------------
// Filter chips
// ---------------------------------------------------------------------------
describe('initFilterChips', () => {
  test('filters rows by badge type', () => {
    espaceModule.initFilterChips();
    const chips = document.querySelectorAll('.filter-group .chip');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    chips[1].click(); // PDF
    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
  });

  test('"Tous" chip shows all rows', () => {
    espaceModule.initFilterChips();
    const chips = document.querySelectorAll('.filter-group .chip');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    chips[1].click(); // PDF filter
    chips[0].click(); // Tous

    rows.forEach((row) => {
      expect(row.style.display).toBe('');
    });
  });
});

// ---------------------------------------------------------------------------
// Publish button
// ---------------------------------------------------------------------------
describe('initPublishButton', () => {
  test('shows error when title is empty', () => {
    espaceModule.initPublishButton();
    document.getElementById('publish-button').click();

    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toMatch(/titre/i);
  });

  test('shows success when form is complete', () => {
    espaceModule.initPublishButton();
    const inputs = document.querySelectorAll('.document-form input[type="text"]');
    const fileInput = document.getElementById('file-input');

    inputs[0].value = 'TD3';
    inputs[1].value = 'Pr. Test';

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'td3.xlsx', size: 512 }],
      writable: false,
      configurable: true,
    });

    document.getElementById('publish-button').click();

    const toast = document.querySelector('.toast');
    expect(toast.textContent).toMatch(/succès/i);
  });
});

// ---------------------------------------------------------------------------
// showToast
// ---------------------------------------------------------------------------
describe('showToast', () => {
  test('creates and displays toast', () => {
    espaceModule.showToast('Test', 'info');
    const toast = document.querySelector('.toast.show');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('Test');
  });

  test('auto-hides after timeout', () => {
    espaceModule.showToast('Fading', 'success');
    const toast = document.querySelector('.toast.show');
    jest.advanceTimersByTime(3600);
    expect(toast.classList.contains('show')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CREDENTIALS
// ---------------------------------------------------------------------------
describe('CREDENTIALS', () => {
  test('has expected default values', () => {
    expect(espaceModule.CREDENTIALS).toEqual({
      username: 'delegue',
      password: 'admin1234',
    });
  });
});

// ---------------------------------------------------------------------------
// initDashboard
// ---------------------------------------------------------------------------
describe('initDashboard', () => {
  test('initializes all dashboard sub-modules without error', () => {
    expect(() => espaceModule.initDashboard()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------
describe('init', () => {
  test('initializes auth and logout without error', () => {
    expect(() => espaceModule.init()).not.toThrow();
  });
});

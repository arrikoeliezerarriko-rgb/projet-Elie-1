/**
 * @jest-environment jsdom
 */

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
          <label><input id="auth-username" type="text" placeholder="Votre identifiant" /></label>
          <label><input id="auth-password" type="password" placeholder="Mot de passe" /></label>
          <button class="primary-button" type="submit">Entrer</button>
        </form>
      </div>
    </div>

    <div class="layout" id="delegate-layout" hidden>
      <aside class="sidebar" id="sidebar">
        <nav class="side-nav">
          <button class="side-link danger side-action" id="side-logout" type="button">Deconnexion</button>
        </nav>
      </aside>

      <div class="main">
        <header class="topbar">
          <button class="icon-button mobile-toggle" id="menu-toggle">☰</button>
          <label class="search-bar">
            <input id="search-input" type="search" placeholder="Rechercher..." />
          </label>
          <button class="icon-button notify-button" id="notify-button">🔔</button>
          <button class="logout-button" id="top-logout" type="button">Deconnexion</button>
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
  sessionStorage.clear();

  var mockCrypto = {
    subtle: {
      digest: jest.fn(function (_algo, data) {
        var bytes = new Uint8Array(data);
        var str = new TextDecoder().decode(bytes);
        // Return the known hash for 'Portail2026!' so login tests pass
        if (str === 'Portail2026!') {
          var hex = 'e5b21c53a6fcf33c242a4eeab94260c7439caea44bfa24b658e3db5f0e2ea9bc';
          var arr = new Uint8Array(hex.match(/.{2}/g).map(function (b) { return parseInt(b, 16); }));
          return Promise.resolve(arr.buffer);
        }
        // Return a different hash for any other password
        var fake = new Uint8Array(32);
        fake[0] = 0xff;
        return Promise.resolve(fake.buffer);
      }),
    },
  };
  Object.defineProperty(global, 'crypto', { value: mockCrypto, writable: true, configurable: true });
  Object.defineProperty(window, 'crypto', { value: mockCrypto, writable: true, configurable: true });

  setUpEspaceDelegueHTML();
  loadEspace();
});

afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = '';
  sessionStorage.clear();
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
describe('initAuth', () => {
  test('shows error for empty credentials', () => {
    var form = document.getElementById('auth-form');
    var usernameInput = document.getElementById('auth-username');
    var passwordInput = document.getElementById('auth-password');

    usernameInput.value = '';
    passwordInput.value = '';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    var error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toMatch(/requis/i);
  });

  test('shows error for wrong username', () => {
    var form = document.getElementById('auth-form');
    var usernameInput = document.getElementById('auth-username');
    var passwordInput = document.getElementById('auth-password');

    usernameInput.value = 'wrong';
    passwordInput.value = 'wrong123';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    var error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toMatch(/incorrect/i);
  });

  test('reveals delegate layout for correct credentials', async () => {
    var form = document.getElementById('auth-form');
    var usernameInput = document.getElementById('auth-username');
    var passwordInput = document.getElementById('auth-password');
    var authScreen = document.getElementById('auth-screen');
    var layout = document.getElementById('delegate-layout');

    usernameInput.value = 'delegue';
    passwordInput.value = 'Portail2026!';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    // Wait for SHA-256 promise to resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(authScreen.hidden).toBe(true);
    expect(layout.hidden).toBe(false);
  });

  test('shows error for short password', () => {
    var form = document.getElementById('auth-form');
    var usernameInput = document.getElementById('auth-username');
    var passwordInput = document.getElementById('auth-password');

    usernameInput.value = 'delegue';
    passwordInput.value = 'ab';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    var error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toMatch(/4 caract/i);
  });

  test('replaces old error message on new attempt', () => {
    var form = document.getElementById('auth-form');
    var usernameInput = document.getElementById('auth-username');
    var passwordInput = document.getElementById('auth-password');

    usernameInput.value = '';
    passwordInput.value = '';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    usernameInput.value = 'wrong';
    passwordInput.value = 'wrong123';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    var errors = document.querySelectorAll('.auth-error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toMatch(/incorrect/i);
  });

  test('stores session on successful login', async () => {
    var form = document.getElementById('auth-form');
    document.getElementById('auth-username').value = 'delegue';
    document.getElementById('auth-password').value = 'Portail2026!';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    await Promise.resolve();
    await Promise.resolve();

    var session = JSON.parse(sessionStorage.getItem('delegue_session'));
    expect(session).not.toBeNull();
    expect(session.user).toBe('delegue');
    expect(typeof session.expires).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// showAuthError
// ---------------------------------------------------------------------------
describe('showAuthError', () => {
  test('inserts an error div into auth-form', () => {
    espaceModule.showAuthError('Test error');
    var error = document.querySelector('.auth-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toBe('Test error');
    expect(error.getAttribute('role')).toBe('alert');
  });

  test('replaces previous error', () => {
    espaceModule.showAuthError('First');
    espaceModule.showAuthError('Second');
    var errors = document.querySelectorAll('.auth-error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toBe('Second');
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
describe('initLogout', () => {
  test('side-logout hides layout and shows auth screen', () => {
    var sideLogout = document.getElementById('side-logout');
    var authScreen = document.getElementById('auth-screen');
    var layout = document.getElementById('delegate-layout');

    sideLogout.click();

    expect(layout.hidden).toBe(true);
    expect(authScreen.hidden).toBe(false);
  });

  test('top-logout hides layout and shows auth screen', () => {
    var topLogout = document.getElementById('top-logout');
    var authScreen = document.getElementById('auth-screen');
    var layout = document.getElementById('delegate-layout');

    topLogout.click();

    expect(layout.hidden).toBe(true);
    expect(authScreen.hidden).toBe(false);
  });

  test('clears form inputs on logout', () => {
    document.getElementById('auth-username').value = 'test';
    document.getElementById('auth-password').value = 'test';
    document.getElementById('side-logout').click();

    expect(document.getElementById('auth-username').value).toBe('');
    expect(document.getElementById('auth-password').value).toBe('');
  });

  test('removes auth-error on logout', () => {
    espaceModule.showAuthError('Some error');
    document.getElementById('side-logout').click();

    expect(document.querySelector('.auth-error')).toBeNull();
  });

  test('clears session on logout', () => {
    sessionStorage.setItem('delegue_session', JSON.stringify({ user: 'delegue', expires: Date.now() + 9999999 }));
    document.getElementById('side-logout').click();

    expect(sessionStorage.getItem('delegue_session')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
describe('initSidebar', () => {
  test('toggles sidebar open class', () => {
    espaceModule.initSidebar();
    var toggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');

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
    var input = document.getElementById('search-input');
    var rows = document.querySelectorAll('.table-wrap tbody tr');

    input.value = 'TD1';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
  });

  test('shows all when query is empty', () => {
    espaceModule.initSearch();
    var input = document.getElementById('search-input');
    var rows = document.querySelectorAll('.table-wrap tbody tr');

    input.value = 'TD1';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    rows.forEach(function (row) {
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
    var dropzone = document.getElementById('dropzone');

    var dragoverEvent = new Event('dragover', { bubbles: true });
    dragoverEvent.preventDefault = jest.fn();
    dropzone.dispatchEvent(dragoverEvent);
    expect(dropzone.classList.contains('dragover')).toBe(true);

    dropzone.dispatchEvent(new Event('dragleave'));
    expect(dropzone.classList.contains('dragover')).toBe(false);
  });

  test('updates file preview for valid file', () => {
    espaceModule.initDropzone();
    var fileInput = document.getElementById('file-input');
    var preview = document.getElementById('file-preview');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'test.docx', size: 2048 }],
      writable: false,
    });
    fileInput.dispatchEvent(new Event('change'));

    expect(preview.textContent).toMatch(/test\.docx/);
  });

  test('rejects disallowed file type via toast', () => {
    espaceModule.initDropzone();
    var fileInput = document.getElementById('file-input');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'image.jpg', size: 2048 }],
      writable: false,
    });
    fileInput.dispatchEvent(new Event('change'));

    var toast = document.querySelector('.notification');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toMatch(/non autoris/i);
  });
});

// ---------------------------------------------------------------------------
// Filter chips
// ---------------------------------------------------------------------------
describe('initFilterChips', () => {
  test('filters rows by badge type', () => {
    espaceModule.initFilterChips();
    var chips = document.querySelectorAll('.filter-group .chip');
    var rows = document.querySelectorAll('.table-wrap tbody tr');

    chips[1].click(); // PDF
    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
  });

  test('"Tous" chip shows all rows', () => {
    espaceModule.initFilterChips();
    var chips = document.querySelectorAll('.filter-group .chip');
    var rows = document.querySelectorAll('.table-wrap tbody tr');

    chips[1].click(); // PDF filter
    chips[0].click(); // Tous

    rows.forEach(function (row) {
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

    var toast = document.querySelector('.notification');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toMatch(/titre/i);
  });

  test('shows success when form is complete', () => {
    espaceModule.initPublishButton();
    var inputs = document.querySelectorAll('.document-form input[type="text"]');
    var fileInput = document.getElementById('file-input');

    inputs[0].value = 'TD3';
    inputs[1].value = 'Pr. Test';

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'td3.xlsx', size: 512 }],
      writable: false,
      configurable: true,
    });

    document.getElementById('publish-button').click();

    var toast = document.querySelector('.notification');
    expect(toast.textContent).toMatch(/succes/i);
  });
});

// ---------------------------------------------------------------------------
// showToast
// ---------------------------------------------------------------------------
describe('showToast', () => {
  test('creates and displays notification', () => {
    espaceModule.showToast('Test', 'info');
    var toast = document.querySelector('.notification.visible');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('Test');
  });

  test('auto-hides after timeout', () => {
    espaceModule.showToast('Fading', 'success');
    var toast = document.querySelector('.notification.visible');
    jest.advanceTimersByTime(3600);
    expect(toast.classList.contains('visible')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Exported credentials (hashed, not plaintext)
// ---------------------------------------------------------------------------
describe('Credential exports', () => {
  test('exports VALID_USERNAME but not plaintext password', () => {
    expect(espaceModule.VALID_USERNAME).toBe('delegue');
    expect(espaceModule.VALID_PASSWORD_HASH).toBeDefined();
    expect(typeof espaceModule.VALID_PASSWORD_HASH).toBe('string');
    expect(espaceModule.VALID_PASSWORD_HASH.length).toBe(64);
    // Must NOT export a plaintext CREDENTIALS object
    expect(espaceModule.CREDENTIALS).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// initDashboard
// ---------------------------------------------------------------------------
describe('initDashboard', () => {
  test('initializes all dashboard sub-modules without error', () => {
    expect(function () { espaceModule.initDashboard(); }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------
describe('init', () => {
  test('initializes auth and logout without error', () => {
    expect(function () { espaceModule.init(); }).not.toThrow();
  });
});

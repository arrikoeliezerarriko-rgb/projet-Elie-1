/**
 * @jest-environment jsdom
 */

let dashboardModule;

function loadDashboard() {
  jest.resetModules();
  dashboardModule = require('../dashboard');
}

function setUpDashboardHTML() {
  document.body.innerHTML = `
    <div class="layout">
      <aside class="sidebar" id="sidebar"></aside>
      <div class="main">
        <header class="topbar">
          <button class="icon-button mobile-toggle" id="menu-toggle">☰</button>
          <label class="search-bar">
            <input id="search-input" type="search" placeholder="Rechercher..." />
          </label>
          <button class="icon-button notify-button" id="notify-button">🔔<span class="dot"></span></button>
          <button class="logout-button" id="logout" type="button">Déconnexion</button>
        </header>

        <main class="content">
          <div class="workspace-grid">
            <article class="panel large-panel" id="add-document">
              <form class="document-form">
                <div class="form-grid">
                  <label><span>Titre</span><input type="text" placeholder="Titre" /></label>
                  <label><span>Matière</span><select><option>Programmation</option></select></label>
                  <label><span>Professeur</span><input type="text" placeholder="Professeur" /></label>
                  <label><span>Type</span><select><option>Cours</option></select></label>
                </div>
                <div class="dropzone" id="dropzone">
                  <input id="file-input" type="file" accept=".pdf,.docx,.xlsx" />
                  <div class="file-preview" id="file-preview"><span>Aucun fichier</span></div>
                  <div class="upload-progress"><div class="upload-progress-bar" id="upload-progress-bar"></div></div>
                </div>
                <button class="primary-button" id="publish-button" type="button">Publier</button>
              </form>
            </article>
          </div>

          <div class="workspace-grid lower-grid">
            <article class="panel" id="my-documents">
              <div class="panel-header">
                <div class="filter-group">
                  <button class="chip active" type="button">Tous</button>
                  <button class="chip" type="button">PDF</button>
                  <button class="chip" type="button">DOCX</button>
                  <button class="chip" type="button">XLSX</button>
                </div>
              </div>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Type</th><th>Nom</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><span class="file-badge pdf">PDF</span></td>
                      <td>TD1 - Python</td>
                    </tr>
                    <tr>
                      <td><span class="file-badge doc">DOCX</span></td>
                      <td>Cours - Modèle relationnel</td>
                    </tr>
                    <tr>
                      <td><span class="file-badge xls">XLSX</span></td>
                      <td>Exercices - Statistiques</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  `;
}

beforeEach(() => {
  jest.useFakeTimers();
  setUpDashboardHTML();
  loadDashboard();
});

afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// Sidebar toggle
// ---------------------------------------------------------------------------
describe('initSidebar', () => {
  test('toggles sidebar open class on click', () => {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle.click();
    expect(sidebar.classList.contains('open')).toBe(true);

    toggle.click();
    expect(sidebar.classList.contains('open')).toBe(false);
  });

  test('does nothing when elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => {
      loadDashboard();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
describe('initSearch', () => {
  test('filters table rows by text content', () => {
    const input = document.getElementById('search-input');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    input.value = 'Python';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);

    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
    expect(rows[2].style.display).toBe('none');
  });

  test('shows all rows when query is cleared', () => {
    const input = document.getElementById('search-input');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    input.value = 'Python';
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
// Filter chips
// ---------------------------------------------------------------------------
describe('initFilterChips', () => {
  test('filters rows when PDF chip is clicked', () => {
    const chips = document.querySelectorAll('.filter-group .chip');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    chips[1].click(); // PDF
    expect(rows[0].style.display).toBe('');
    expect(rows[1].style.display).toBe('none');
    expect(rows[2].style.display).toBe('none');
  });

  test('shows all rows when "Tous" chip is clicked', () => {
    const chips = document.querySelectorAll('.filter-group .chip');
    const rows = document.querySelectorAll('.table-wrap tbody tr');

    chips[1].click(); // PDF filter
    chips[0].click(); // Tous

    rows.forEach((row) => {
      expect(row.style.display).toBe('');
    });
  });

  test('updates active state on chip click', () => {
    const chips = document.querySelectorAll('.filter-group .chip');

    chips[2].click(); // DOCX
    expect(chips[0].classList.contains('active')).toBe(false);
    expect(chips[2].classList.contains('active')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------
describe('initDropzone', () => {
  test('adds dragover class on dragover event', () => {
    const dropzone = document.getElementById('dropzone');

    const dragoverEvent = new Event('dragover', { bubbles: true });
    dragoverEvent.preventDefault = jest.fn();
    dropzone.dispatchEvent(dragoverEvent);

    expect(dropzone.classList.contains('dragover')).toBe(true);
  });

  test('removes dragover class on dragleave', () => {
    const dropzone = document.getElementById('dropzone');

    const dragoverEvent = new Event('dragover', { bubbles: true });
    dragoverEvent.preventDefault = jest.fn();
    dropzone.dispatchEvent(dragoverEvent);
    dropzone.dispatchEvent(new Event('dragleave'));

    expect(dropzone.classList.contains('dragover')).toBe(false);
  });

  test('updates preview when a valid file is selected', () => {
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('file-preview');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'report.pdf', size: 5120 }],
      writable: false,
    });
    fileInput.dispatchEvent(new Event('change'));

    expect(preview.textContent).toMatch(/report\.pdf/);
  });

  test('shows error for disallowed file type', () => {
    const fileInput = document.getElementById('file-input');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'image.png', size: 5120 }],
      writable: false,
    });
    fileInput.dispatchEvent(new Event('change'));

    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toMatch(/non autorisé/i);
  });
});

// ---------------------------------------------------------------------------
// Publish button
// ---------------------------------------------------------------------------
describe('initPublishButton', () => {
  test('shows error when title is missing', () => {
    const publishBtn = document.getElementById('publish-button');

    publishBtn.click();

    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toMatch(/titre/i);
  });

  test('shows error when file is missing', () => {
    const publishBtn = document.getElementById('publish-button');
    const inputs = document.querySelectorAll('.document-form input[type="text"]');
    inputs[0].value = 'Test Title';
    inputs[1].value = 'Pr. Test';

    publishBtn.click();

    const toast = document.querySelector('.toast');
    expect(toast.textContent).toMatch(/fichier/i);
  });

  test('shows success when form is valid', () => {
    const publishBtn = document.getElementById('publish-button');
    const inputs = document.querySelectorAll('.document-form input[type="text"]');
    const fileInput = document.getElementById('file-input');

    inputs[0].value = 'TD2 - Tables';
    inputs[1].value = 'Pr. Kouamé';

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'td2.pdf', size: 1024 }],
      writable: false,
      configurable: true,
    });

    publishBtn.click();

    const toast = document.querySelector('.toast');
    expect(toast.textContent).toMatch(/succès/i);
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
describe('initLogout', () => {
  test('shows deconnexion toast when logout is clicked', () => {
    const logoutBtn = document.getElementById('logout');

    logoutBtn.click();

    const toast = document.querySelector('.toast');
    expect(toast.textContent).toMatch(/déconnexion/i);
  });
});

// ---------------------------------------------------------------------------
// showToast
// ---------------------------------------------------------------------------
describe('showToast', () => {
  test('creates toast if none exists and shows it', () => {
    document.querySelectorAll('.toast').forEach((t) => t.remove());

    dashboardModule.showToast('Hello', 'success');

    const toast = document.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('Hello');
    expect(toast.classList.contains('success')).toBe(true);
    expect(toast.classList.contains('show')).toBe(true);
  });

  test('reuses existing toast element', () => {
    const existing = document.createElement('div');
    existing.className = 'toast';
    document.body.appendChild(existing);

    dashboardModule.showToast('Reused', 'error');

    const toasts = document.querySelectorAll('.toast');
    expect(toasts.length).toBeGreaterThanOrEqual(1);
    const toast = document.querySelector('.toast.show');
    expect(toast.textContent).toBe('Reused');
  });

  test('hides toast after timeout', () => {
    dashboardModule.showToast('Temp', 'info');
    const toast = document.querySelector('.toast.show');
    expect(toast).not.toBeNull();
    jest.advanceTimersByTime(3600);
    expect(toast.classList.contains('show')).toBe(false);
  });
});

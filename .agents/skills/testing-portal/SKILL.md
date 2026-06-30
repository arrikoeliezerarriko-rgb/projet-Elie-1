---
name: testing-portal-des-cours
description: Test the Portail des Cours web app end-to-end. Use when verifying JS module changes, search, auth, sidebar, filter chips, or file upload features.
---

# Testing the Portail des Cours App

## Overview
Static HTML/CSS/JS portal with 3 pages:
- `index.html` — public course portal (search, modal, file upload)
- `dashboard.html` — delegate dashboard (sidebar, search, dropzone, filter chips, publish)
- `espace-delegue.html` — delegate auth + dashboard (login form, then same dashboard features)

## Local Dev Setup
```bash
cd /home/ubuntu/repos/projet-Elie-1
npm install
python3 -m http.server 8080 &
# Pages available at http://localhost:8080/{index,dashboard,espace-delegue}.html
```

## Running Unit Tests
```bash
npm test          # runs jest --coverage
npm run test:watch  # watch mode
```
- 4 test suites in `tests/` directory
- Jest 29.7 + jest-environment-jsdom
- Coverage report printed to terminal

## Key Test Credentials
- Delegate login: username `delegue`, password `admin1234` (hardcoded in `espace-delegue.js`)

## Known Issues / Gotchas

### Browser vs Jest Module Loading
The JS modules use an IIFE pattern with CommonJS fallback:
```js
var utils = typeof require === 'function' ? require('./src/utils') : window.PortailUtils;
```
- **Jest**: `require()` works, tests pass
- **Browser**: `require()` is unavailable, falls back to `window.PortailUtils`
- If `src/utils.js` doesn't set `window.PortailUtils`, all interactive features break silently
- Always test in both Jest AND a real browser to catch this class of issue

### IIFE Auto-Initialization
Modules auto-call `init()` on load via IIFE. In tests, don't call `init()` again or you get duplicate event listeners that cancel each other out. Only call sub-init functions (like `initSidebar()`) when they aren't auto-called by the main `init()`.

## What to Test in Browser
1. **index.html**: Search bar filters document table rows (debounced 250ms). Modal opens via "Contacter le delegue" button. File upload button triggers hidden file input.
2. **espace-delegue.html**: Auth form validates credentials. Wrong creds show error. Correct creds hide auth screen, show dashboard. Logout returns to auth screen and clears fields.
3. **dashboard.html**: Hamburger menu toggles sidebar "open" class. Search filters table rows. Filter chips (Tous/PDF/DOCX/XLSX) filter by file type badge. Publish button validates form fields.

## HTML Structure Notes
- Search input: `#document-search` (index.html) or `input[type="search"]` (dashboard/espace-delegue)
- Sidebar: `#sidebar` or `aside` element
- Menu toggle: `#menu-toggle` or `button[aria-label="Ouvrir le menu"]`
- Document table: `.table-card tbody` (index) or `.table-wrap tbody` (dashboard/espace-delegue)
- Filter chips: `.filter-group .chip` buttons
- Auth form: `#auth-form` with `#auth-username` and `#auth-password`
- Modal: `#delegate-modal`

## Devin Secrets Needed
None — all credentials are hardcoded for local dev.

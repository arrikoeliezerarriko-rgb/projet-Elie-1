const {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  getFileExtension,
  isAllowedFileType,
  getFileBadgeType,
  formatFileSize,
  formatDate,
  sanitizeInput,
  normalizeText,
  filterDocuments,
  filterByType,
  validateLoginForm,
  validateEmail,
  validateDocumentForm,
  debounce,
  truncateText,
  parseDocumentRows,
} = require('../src/utils');

// ---------------------------------------------------------------------------
// getFileExtension
// ---------------------------------------------------------------------------
describe('getFileExtension', () => {
  test('returns extension for standard filenames', () => {
    expect(getFileExtension('report.pdf')).toBe('.pdf');
    expect(getFileExtension('data.xlsx')).toBe('.xlsx');
    expect(getFileExtension('notes.DOC')).toBe('.doc');
  });

  test('returns last extension for multiple dots', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('.gz');
  });

  test('returns empty string for no extension', () => {
    expect(getFileExtension('README')).toBe('');
  });

  test('returns empty string for trailing dot', () => {
    expect(getFileExtension('file.')).toBe('');
  });

  test('handles null / undefined / non-string', () => {
    expect(getFileExtension(null)).toBe('');
    expect(getFileExtension(undefined)).toBe('');
    expect(getFileExtension(42)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// isAllowedFileType
// ---------------------------------------------------------------------------
describe('isAllowedFileType', () => {
  test('accepts PDF, DOC, DOCX, XLS, XLSX', () => {
    expect(isAllowedFileType('a.pdf')).toBe(true);
    expect(isAllowedFileType('a.doc')).toBe(true);
    expect(isAllowedFileType('a.docx')).toBe(true);
    expect(isAllowedFileType('a.xls')).toBe(true);
    expect(isAllowedFileType('a.xlsx')).toBe(true);
  });

  test('is case-insensitive', () => {
    expect(isAllowedFileType('A.PDF')).toBe(true);
    expect(isAllowedFileType('B.Docx')).toBe(true);
  });

  test('rejects non-allowed types', () => {
    expect(isAllowedFileType('image.png')).toBe(false);
    expect(isAllowedFileType('script.js')).toBe(false);
    expect(isAllowedFileType('archive.zip')).toBe(false);
  });

  test('rejects files with no extension', () => {
    expect(isAllowedFileType('README')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getFileBadgeType
// ---------------------------------------------------------------------------
describe('getFileBadgeType', () => {
  test('maps PDF files', () => {
    expect(getFileBadgeType('file.pdf')).toBe('pdf');
  });

  test('maps DOC / DOCX files', () => {
    expect(getFileBadgeType('file.doc')).toBe('doc');
    expect(getFileBadgeType('file.docx')).toBe('doc');
  });

  test('maps XLS / XLSX files', () => {
    expect(getFileBadgeType('file.xls')).toBe('xls');
    expect(getFileBadgeType('file.xlsx')).toBe('xls');
  });

  test('returns unknown for other types', () => {
    expect(getFileBadgeType('file.png')).toBe('unknown');
    expect(getFileBadgeType('')).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// formatFileSize
// ---------------------------------------------------------------------------
describe('formatFileSize', () => {
  test('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 o');
  });

  test('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 Ko');
    expect(formatFileSize(1536)).toBe('1.5 Ko');
  });

  test('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 Mo');
  });

  test('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 Go');
  });

  test('returns 0 o for zero', () => {
    expect(formatFileSize(0)).toBe('0 o');
  });

  test('returns 0 o for negative / non-number', () => {
    expect(formatFileSize(-1)).toBe('0 o');
    expect(formatFileSize('abc')).toBe('0 o');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  test('formats a valid date as DD/MM/YYYY', () => {
    expect(formatDate(new Date(2026, 5, 26))).toBe('26/06/2026');
    expect(formatDate(new Date(2026, 0, 1))).toBe('01/01/2026');
  });

  test('returns empty string for invalid date', () => {
    expect(formatDate(new Date('invalid'))).toBe('');
  });

  test('returns empty string for non-Date inputs', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('2026-06-26')).toBe('');
    expect(formatDate(12345)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// sanitizeInput
// ---------------------------------------------------------------------------
describe('sanitizeInput', () => {
  test('escapes HTML entities', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  test('escapes ampersands', () => {
    expect(sanitizeInput('A & B')).toBe('A &amp; B');
  });

  test('escapes single quotes', () => {
    expect(sanitizeInput("it's")).toBe('it&#x27;s');
  });

  test('returns empty string for non-string', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  test('leaves safe strings unchanged', () => {
    expect(sanitizeInput('hello world')).toBe('hello world');
  });
});

// ---------------------------------------------------------------------------
// normalizeText
// ---------------------------------------------------------------------------
describe('normalizeText', () => {
  test('lowercases text', () => {
    expect(normalizeText('HELLO')).toBe('hello');
  });

  test('removes diacritics', () => {
    expect(normalizeText('Réseaux')).toBe('reseaux');
    expect(normalizeText('Mathématiques')).toBe('mathematiques');
    expect(normalizeText('éàü')).toBe('eau');
  });

  test('trims whitespace', () => {
    expect(normalizeText('  test  ')).toBe('test');
  });

  test('returns empty string for non-string', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(42)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// filterDocuments
// ---------------------------------------------------------------------------
describe('filterDocuments', () => {
  const docs = [
    { title: 'TD1 - Introduction à Python', subject: 'Programmation', professor: 'Pr. N\'Guessan', fileType: 'pdf' },
    { title: 'Cours - Modèle relationnel', subject: 'Bases de données', professor: 'Pr. Kouamé', fileType: 'doc' },
    { title: 'Exercices - Séries statistiques', subject: 'Statistiques', professor: 'Pr. Akissi', fileType: 'xls' },
    { title: 'TP Réseaux - Adressage IP', subject: 'Réseaux', professor: 'Pr. Traoré', fileType: 'pdf' },
  ];

  test('returns all documents when query is empty', () => {
    expect(filterDocuments(docs, '')).toHaveLength(4);
    expect(filterDocuments(docs, null)).toHaveLength(4);
    expect(filterDocuments(docs, '  ')).toHaveLength(4);
  });

  test('filters by title', () => {
    const result = filterDocuments(docs, 'Python');
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Python');
  });

  test('filters by subject', () => {
    expect(filterDocuments(docs, 'Réseaux')).toHaveLength(1);
  });

  test('filters by professor', () => {
    expect(filterDocuments(docs, 'Kouamé')).toHaveLength(1);
  });

  test('is accent-insensitive', () => {
    expect(filterDocuments(docs, 'reseaux')).toHaveLength(1);
    expect(filterDocuments(docs, 'Kouame')).toHaveLength(1);
  });

  test('is case-insensitive', () => {
    expect(filterDocuments(docs, 'python')).toHaveLength(1);
    expect(filterDocuments(docs, 'PYTHON')).toHaveLength(1);
  });

  test('returns empty array for no matches', () => {
    expect(filterDocuments(docs, 'zzzzz')).toHaveLength(0);
  });

  test('returns empty array for non-array input', () => {
    expect(filterDocuments(null, 'test')).toEqual([]);
    expect(filterDocuments('not-array', 'test')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// filterByType
// ---------------------------------------------------------------------------
describe('filterByType', () => {
  const docs = [
    { filename: 'a.pdf' },
    { filename: 'b.docx' },
    { filename: 'c.xlsx' },
    { filename: 'd.pdf' },
  ];

  test('returns all docs when type is "tous"', () => {
    expect(filterByType(docs, 'Tous')).toHaveLength(4);
    expect(filterByType(docs, 'tous')).toHaveLength(4);
  });

  test('returns all docs when type is empty', () => {
    expect(filterByType(docs, '')).toHaveLength(4);
    expect(filterByType(docs, null)).toHaveLength(4);
  });

  test('filters PDFs', () => {
    expect(filterByType(docs, 'pdf')).toHaveLength(2);
  });

  test('filters DOCs', () => {
    expect(filterByType(docs, 'doc')).toHaveLength(1);
  });

  test('filters XLS', () => {
    expect(filterByType(docs, 'xls')).toHaveLength(1);
  });

  test('returns empty for non-array', () => {
    expect(filterByType(null, 'pdf')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// validateLoginForm
// ---------------------------------------------------------------------------
describe('validateLoginForm', () => {
  test('valid credentials pass', () => {
    const result = validateLoginForm('admin', 'password');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('empty username fails', () => {
    const result = validateLoginForm('', 'password');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Le nom d'utilisateur est requis.");
  });

  test('null username fails', () => {
    expect(validateLoginForm(null, 'password').valid).toBe(false);
  });

  test('empty password fails', () => {
    const result = validateLoginForm('admin', '');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe est requis.');
  });

  test('short password fails', () => {
    const result = validateLoginForm('admin', 'abc');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 4 caractères.');
  });

  test('both empty yields two errors', () => {
    const result = validateLoginForm('', '');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  test('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('a.b@c.co')).toBe(true);
  });

  test('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  test('rejects null / undefined', () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateDocumentForm
// ---------------------------------------------------------------------------
describe('validateDocumentForm', () => {
  const validData = {
    title: 'TD1',
    subject: 'Programmation',
    professor: 'Pr. Test',
    file: { name: 'doc.pdf', size: 1024 },
  };

  test('valid data passes', () => {
    const result = validateDocumentForm(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing title fails', () => {
    const result = validateDocumentForm({ ...validData, title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/titre/i);
  });

  test('missing subject fails', () => {
    const result = validateDocumentForm({ ...validData, subject: '' });
    expect(result.valid).toBe(false);
  });

  test('missing professor fails', () => {
    const result = validateDocumentForm({ ...validData, professor: '' });
    expect(result.valid).toBe(false);
  });

  test('missing file fails', () => {
    const result = validateDocumentForm({ ...validData, file: null });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/fichier.*requis/i);
  });

  test('disallowed file type fails', () => {
    const result = validateDocumentForm({ ...validData, file: { name: 'img.png', size: 100 } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/type de fichier/i);
  });

  test('file too large fails', () => {
    const result = validateDocumentForm({ ...validData, file: { name: 'big.pdf', size: MAX_FILE_SIZE + 1 } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/taille maximale/i);
  });
});

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------
describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('delays execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('resets timer on repeated calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced();
    jest.advanceTimersByTime(100);
    debounced();
    jest.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// truncateText
// ---------------------------------------------------------------------------
describe('truncateText', () => {
  test('does not truncate short text', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  test('truncates long text', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });

  test('returns original when maxLength equals length', () => {
    expect(truncateText('abc', 3)).toBe('abc');
  });

  test('returns empty string for non-string', () => {
    expect(truncateText(null, 5)).toBe('');
    expect(truncateText(42, 5)).toBe('');
  });

  test('returns text when maxLength is negative', () => {
    expect(truncateText('hello', -1)).toBe('hello');
  });
});

// ---------------------------------------------------------------------------
// parseDocumentRows
// ---------------------------------------------------------------------------
describe('parseDocumentRows', () => {
  test('parses rows with data-document attributes', () => {
    document.body.innerHTML = `
      <table>
        <tbody id="tb">
          <tr data-document data-title="Doc1" data-subject="Math" data-professor="Pr. A" data-file-type="pdf"></tr>
          <tr data-document data-title="Doc2" data-subject="Info" data-professor="Pr. B" data-file-type="doc"></tr>
        </tbody>
      </table>
    `;
    const tbody = document.getElementById('tb');
    const result = parseDocumentRows(tbody);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ title: 'Doc1', subject: 'Math', professor: 'Pr. A', fileType: 'pdf' });
    expect(result[1]).toEqual({ title: 'Doc2', subject: 'Info', professor: 'Pr. B', fileType: 'doc' });
  });

  test('returns empty array for null input', () => {
    expect(parseDocumentRows(null)).toEqual([]);
  });

  test('returns empty array when no data-document rows', () => {
    document.body.innerHTML = '<table><tbody id="tb"><tr><td>no attr</td></tr></tbody></table>';
    const tbody = document.getElementById('tb');
    expect(parseDocumentRows(tbody)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('constants', () => {
  test('ALLOWED_EXTENSIONS contains expected types', () => {
    expect(ALLOWED_EXTENSIONS).toContain('.pdf');
    expect(ALLOWED_EXTENSIONS).toContain('.doc');
    expect(ALLOWED_EXTENSIONS).toContain('.docx');
    expect(ALLOWED_EXTENSIONS).toContain('.xls');
    expect(ALLOWED_EXTENSIONS).toContain('.xlsx');
  });

  test('MAX_FILE_SIZE is 50 MB', () => {
    expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
  });
});

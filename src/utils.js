const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === filename.length - 1) return '';
  return filename.slice(dotIndex).toLowerCase();
}

function isAllowedFileType(filename) {
  const ext = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

function getFileBadgeType(filename) {
  const ext = getFileExtension(filename);
  if (ext === '.pdf') return 'pdf';
  if (ext === '.doc' || ext === '.docx') return 'doc';
  if (ext === '.xls' || ext === '.xlsx') return 'xls';
  return 'unknown';
}

function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return '0 o';
  if (bytes === 0) return '0 o';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function filterDocuments(documents, query) {
  if (!Array.isArray(documents)) return [];
  if (!query || typeof query !== 'string' || query.trim() === '') return documents;
  const normalizedQuery = normalizeText(query);
  return documents.filter(function (doc) {
    const title = normalizeText(doc.title || '');
    const subject = normalizeText(doc.subject || '');
    const professor = normalizeText(doc.professor || '');
    const fileType = normalizeText(doc.fileType || '');
    return (
      title.includes(normalizedQuery) ||
      subject.includes(normalizedQuery) ||
      professor.includes(normalizedQuery) ||
      fileType.includes(normalizedQuery)
    );
  });
}

function filterByType(documents, type) {
  if (!Array.isArray(documents)) return [];
  if (!type || type.toLowerCase() === 'tous') return documents;
  const normalizedType = type.toLowerCase();
  return documents.filter(function (doc) {
    const badgeType = getFileBadgeType(doc.filename || '');
    return badgeType === normalizedType;
  });
}

function validateLoginForm(username, password) {
  var errors = [];
  if (!username || typeof username !== 'string' || username.trim() === '') {
    errors.push('Le nom d\'utilisateur est requis.');
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Le mot de passe est requis.');
  } else if (password.length < 4) {
    errors.push('Le mot de passe doit contenir au moins 4 caractères.');
  }
  return { valid: errors.length === 0, errors: errors };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function validateDocumentForm(data) {
  var errors = [];
  if (!data.title || data.title.trim() === '') {
    errors.push('Le titre du document est requis.');
  }
  if (!data.subject || data.subject.trim() === '') {
    errors.push('La matière est requise.');
  }
  if (!data.professor || data.professor.trim() === '') {
    errors.push('Le nom du professeur est requis.');
  }
  if (!data.file) {
    errors.push('Un fichier est requis.');
  } else if (!isAllowedFileType(data.file.name || '')) {
    errors.push('Le type de fichier n\'est pas autorisé.');
  } else if (data.file.size > MAX_FILE_SIZE) {
    errors.push('Le fichier dépasse la taille maximale autorisée (50 Mo).');
  }
  return { valid: errors.length === 0, errors: errors };
}

function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

function truncateText(text, maxLength) {
  if (typeof text !== 'string') return '';
  if (typeof maxLength !== 'number' || maxLength < 0) return text;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function parseDocumentRows(tbody) {
  if (!tbody || !tbody.querySelectorAll) return [];
  var rows = tbody.querySelectorAll('tr[data-document]');
  var documents = [];
  rows.forEach(function (row) {
    documents.push({
      title: row.getAttribute('data-title') || '',
      subject: row.getAttribute('data-subject') || '',
      professor: row.getAttribute('data-professor') || '',
      fileType: row.getAttribute('data-file-type') || '',
    });
  });
  return documents;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ALLOWED_EXTENSIONS: ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE: MAX_FILE_SIZE,
    getFileExtension: getFileExtension,
    isAllowedFileType: isAllowedFileType,
    getFileBadgeType: getFileBadgeType,
    formatFileSize: formatFileSize,
    formatDate: formatDate,
    sanitizeInput: sanitizeInput,
    normalizeText: normalizeText,
    filterDocuments: filterDocuments,
    filterByType: filterByType,
    validateLoginForm: validateLoginForm,
    validateEmail: validateEmail,
    validateDocumentForm: validateDocumentForm,
    debounce: debounce,
    truncateText: truncateText,
    parseDocumentRows: parseDocumentRows,
  };
}

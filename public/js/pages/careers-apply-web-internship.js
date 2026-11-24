document.addEventListener('DOMContentLoaded', function () {
  var emailField = document.querySelector('#Email');
  if (!emailField) return;
  var form = emailField.closest('form');
  var fieldRow = emailField.parentElement; // the row containing label + input (Div Block 229)
  var blockedDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'aol.com', 'protonmail.com', 'rediffmail.com',
    'live.com', 'msn.com'
  ];
  function showError(msg) {
    var existing = document.querySelector('.custom-email-error');
    if (!existing) {
      existing = document.createElement('div');
      existing.className = 'custom-email-error';
      existing.style.color = '#ff4d4d';
      existing.style.marginTop = '8px';
      existing.style.marginBottom = '8px';
      existing.style.fontSize = '14px';
      existing.style.width = '100%';
      // Insert after the whole row (label + input), not just the input
      fieldRow.insertAdjacentElement('afterend', existing);
    }
    existing.innerText = msg;
    emailField.style.borderColor = '#ff4d4d';
  }
  function clearError() {
    var existing = document.querySelector('.custom-email-error');
    if (existing) existing.remove();
    emailField.style.borderColor = '';
  }
  function isBlocked(email) {
    var domain = email.trim().toLowerCase().split('@')[1] || '';
    return blockedDomains.includes(domain);
  }
  emailField.addEventListener('blur', function () {
    if (emailField.value && isBlocked(emailField.value)) {
      showError('Please use your university email — personal emails like Gmail or Yahoo are not accepted.');
    } else {
      clearError();
    }
  });
  emailField.addEventListener('input', function () {
    if (emailField.value && !isBlocked(emailField.value)) {
      clearError();
    }
  });
  if (form) {
    form.addEventListener('submit', function (e) {
      if (isBlocked(emailField.value)) {
        e.preventDefault();
        e.stopPropagation();
        showError('Please use your university email — personal emails like Gmail or Yahoo are not accepted.');
        emailField.focus();
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  // ---- CONFIG: replace each id with the exact ID from Settings > ID for that field ----
  var linkFields = {
    resume:     { id: 'Resume-Link' },
    linkedin:   { id: 'LinkedIn-Link' },
    gitRepo:    { id: 'Git-Repo-Link' },
    assignment: { id: 'Assignment-Link' },
    video:      { id: 'Video-Link' },
    portfolio:  { id: 'Portfolio-Link' }
  };
  var elements = {};
  Object.keys(linkFields).forEach(function (key) {
    var el = document.querySelector('#' + linkFields[key].id);
    if (el) elements[key] = el;
  });
  if (!elements.assignment) return;
  var form = elements.assignment.closest('form');
  var blockedHosts = [
    'drive.google.com', 'docs.google.com', 'sites.google.com', 'photos.google.com',
    'dropbox.com', 'www.dropbox.com', 'onedrive.live.com', '1drv.ms',
    'mega.nz', 'wetransfer.com', 'mediafire.com', 'box.com', 'icloud.com'
  ];
  var placeholderHosts = [
    'example.com', 'test.com', 'domain.com', 'yourdomain.com',
    'localhost', '127.0.0.1', 'yoursite.com', 'website.com'
  ];
  function getDomain(url) {
    try {
      var u = new URL(url.trim());
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
      return u.hostname.toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return null;
    }
  }
  function isDummyText(value) {
    var v = value.trim().toLowerCase();
    var dummy = ['n/a', 'na', 'none', 'test', 'asdf', 'xxx', 'link', 'todo', '-', '.'];
    return dummy.indexOf(v) !== -1;
  }
  // ---- This is the part that changed: forces the message onto its own line below the field ----
  function fieldError(el, msg) {
    clearFieldError(el);
    var err = document.createElement('div');
    err.className = 'custom-link-error';
    err.style.color = '#ff4d4d';
    err.style.marginTop = '8px';
    err.style.marginBottom = '8px';
    err.style.fontSize = '14px';
    err.style.display = 'block';
    err.style.width = '100%';
    err.style.flexBasis = '100%';
    err.style.flexShrink = '0';
    err.style.order = '999';
    err.innerText = msg;
    var parent = el.parentElement;
    if (parent) {
      var display = getComputedStyle(parent).display;
      if (display === 'flex' || display === 'inline-flex') {
        parent.style.flexWrap = 'wrap';
      }
    }
    el.insertAdjacentElement('afterend', err);
    el.style.borderColor = '#ff4d4d';
  }
  function clearFieldError(el) {
    el.style.borderColor = '';
    var next = el.nextElementSibling;
    if (next && next.classList.contains('custom-link-error')) next.remove();
  }
  function validateAssignmentLink() {
    var el = elements.assignment;
    var value = el.value.trim();
    if (!value) { clearFieldError(el); return true; }
    if (isDummyText(value)) {
      fieldError(el, 'Please enter a real, working link — not placeholder text.');
      return false;
    }
    var domain = getDomain(value);
    if (!domain) {
      fieldError(el, 'Please enter a valid URL starting with https://');
      return false;
    }
    if (placeholderHosts.indexOf(domain) !== -1) {
      fieldError(el, 'That looks like a placeholder link. Enter your actual project URL.');
      return false;
    }
    if (blockedHosts.indexOf(domain) !== -1) {
      fieldError(el, 'File-storage links (Drive, Dropbox, etc.) aren\'t accepted. Submit a published/live link (Vercel, Netlify, GitHub Pages, Render, your own domain, etc.).');
      return false;
    }
    clearFieldError(el);
    return true;
  }
  function validateUniqueness() {
    var seen = {};
    var ok = true;
    var keys = Object.keys(elements);
    keys.forEach(function (key) {
      var value = elements[key].value.trim().toLowerCase().replace(/\/$/, '');
      if (!value) { clearFieldError(elements[key]); return; }
      if (seen[value]) {
        ok = false;
        fieldError(elements[key], 'This link matches another field — each link must be unique.');
        fieldError(seen[value], 'This link matches another field — each link must be unique.');
      } else {
        seen[value] = elements[key];
        if (key !== 'assignment') clearFieldError(elements[key]);
      }
    });
    return ok;
  }
  Object.keys(elements).forEach(function (key) {
    elements[key].addEventListener('blur', function () {
      validateUniqueness();
      if (key === 'assignment') validateAssignmentLink();
    });
  });
  if (form) {
    form.addEventListener('submit', function (e) {
      var assignmentOk = validateAssignmentLink();
      var uniqueOk = validateUniqueness();
      if (!assignmentOk || !uniqueOk) {
        e.preventDefault();
        e.stopPropagation();
        if (!assignmentOk) elements.assignment.focus();
      }
    });
  }
});
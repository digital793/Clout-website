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
/**
 * Cloutgency — Client-Side Form Submissions & Custom Luxury Dropdowns
 * Connects Webflow exported form elements to our Node.js Express API
 */
document.addEventListener('DOMContentLoaded', () => {

  // ─── Contact Forms ─────────────────────────────────────────────────────────
  const contactForms = document.querySelectorAll('#wf-form-Contactus-form-2, #email-form-2, form[data-name="Contactus-form"]');

  contactForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const parentWrap = form.closest('.w-form') || form.parentElement;
      const successBox = parentWrap.querySelector('.w-form-done');
      const failBox    = parentWrap.querySelector('.w-form-fail');
      const submitBtn  = form.querySelector('input[type="submit"], button[type="submit"]');

      const originalBtnVal = submitBtn ? (submitBtn.value || submitBtn.textContent) : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === 'INPUT') submitBtn.value = submitBtn.dataset.wait || 'Please wait...';
        else submitBtn.textContent = submitBtn.dataset.wait || 'Please wait...';
      }

      if (failBox) failBox.style.display = 'none';

      const payload = {
        name:    (form.querySelector('#Name, #name-2, input[name="Name"], input[name="name"]') || {}).value,
        email:   (form.querySelector('#Email, #email-2, input[name="Email"], input[name="email"]') || {}).value,
        phone:   (form.querySelector('#Phone, input[name="Phone"], input[name="phone"]') || {}).value,
        company: (form.querySelector('#Company, input[name="Company"], input[name="company"]') || {}).value,
        service: (form.querySelector('#Service, #field-2, select[name="Service"], select[name="field-2"]') || {}).value,
        message: (form.querySelector('#Message, #field-3, textarea[name="Message"], textarea[name="field-3"]') || {}).value,
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          form.style.display = 'none';
          if (successBox) {
            successBox.style.display = 'block';
            if (data.message) {
              const msgEl = successBox.querySelector('div');
              if (msgEl) msgEl.textContent = data.message;
            }
          }
        } else {
          throw new Error(data.error || 'Submission failed');
        }
      } catch (err) {
        if (failBox) {
          failBox.style.display = 'block';
          const failMsg = failBox.querySelector('div');
          if (failMsg) failMsg.textContent = err.message || 'Oops! Something went wrong.';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === 'INPUT') submitBtn.value = originalBtnVal;
          else submitBtn.textContent = originalBtnVal;
        }
      }
    });
  });

  // ─── Career Application Forms ──────────────────────────────────────────────
  const applyForms = document.querySelectorAll(
    '#wf-form-Careers-Form, form[id*="Careers" i], form[data-name*="Careers" i], form[id*="career" i], form[data-name*="career" i], form[action*="apply"], form[data-name*="apply" i], form[id*="apply" i]'
  );

  applyForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const parentWrap = form.closest('.w-form') || form.parentElement;
      const successBox = parentWrap.querySelector('.w-form-done');
      const failBox    = parentWrap.querySelector('.w-form-fail');
      const submitBtn  = form.querySelector('input[type="submit"], button[type="submit"]');

      const originalBtnVal = submitBtn ? (submitBtn.value || submitBtn.textContent) : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === 'INPUT') submitBtn.value = submitBtn.dataset.wait || 'Please wait...';
        else submitBtn.textContent = submitBtn.dataset.wait || 'Please wait...';
      }

      if (failBox) failBox.style.display = 'none';

      const payload = {
        name:      (form.querySelector('#Name, input[name="Name"], input[name*="name" i]') || {}).value,
        email:     (form.querySelector('#Email, input[name="Email"], input[name*="email" i]') || {}).value,
        phone:     (form.querySelector('#Phone, input[name="Phone"], input[name*="phone" i]') || {}).value,
        role:      (form.querySelector('#Job-Selector, select[name="Job-Selector"], select[name*="role" i], #Role, input[name*="role" i]') || {}).value || document.title.split('—')[0].trim(),
        resume:    (form.querySelector('#Resume-Link, input[name="Resume-Link"], input[name*="resume" i]') || {}).value,
        portfolio: (form.querySelector('#Portfolio-Link, input[name="Portfolio-Link"], input[name*="portfolio" i], input[name*="link" i], #Portfolio') || {}).value,
        onsite:    (form.querySelector('#Onsite, select[name="Onsite"], select[name*="onsite" i]') || {}).value,
        linkedin:  (form.querySelector('#LinkedIn, input[name="LinkedIn"], input[name*="linkedin" i]') || {}).value,
        message:   (form.querySelector('#Cover-Letter, textarea[name="Cover-Letter"], textarea') || {}).value,
      };

      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          form.style.display = 'none';
          if (successBox) {
            successBox.style.display = 'block';
            if (data.message) {
              const msgEl = successBox.querySelector('div');
              if (msgEl) msgEl.textContent = data.message;
            }
          }
        } else {
          throw new Error(data.error || 'Application submission failed');
        }
      } catch (err) {
        if (failBox) {
          failBox.style.display = 'block';
          const failMsg = failBox.querySelector('div');
          if (failMsg) failMsg.textContent = err.message || 'Oops! Something went wrong.';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === 'INPUT') submitBtn.value = originalBtnVal;
          else submitBtn.textContent = originalBtnVal;
        }
      }
    });
  });

  // ─── Newsletter Form ────────────────────────────────────────────────────────
  const newsletterForm = document.getElementById('News_letter');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const parentWrap = newsletterForm.closest('.w-form') || newsletterForm.parentElement;
      const successBox = parentWrap.querySelector('.w-form-done');
      newsletterForm.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    });
  }

  // ─── Luxury Custom Dropdown Component ───────────────────────────────────────
  initLuxurySelects();
});

function initLuxurySelects() {
  const selects = document.querySelectorAll('select.select-field-3, select.w-select');

  selects.forEach(select => {
    if (select.dataset.luxuryInit) return;
    select.dataset.luxuryInit = 'true';

    // Hide native select visually while keeping it in the DOM and functional
    select.style.position = 'absolute';
    select.style.opacity = '0';
    select.style.pointerEvents = 'none';
    select.style.zIndex = '-1';
    select.style.width = '1px';
    select.style.height = '1px';

    const wrapper = document.createElement('div');
    wrapper.className = 'clout-custom-select-wrap';

    const trigger = document.createElement('div');
    trigger.className = 'clout-select-trigger';
    trigger.setAttribute('tabindex', '0');

    const triggerText = document.createElement('span');
    triggerText.className = 'trigger-text';

    const selectedOption = select.options[select.selectedIndex] || select.options[0];
    const initialText = selectedOption ? selectedOption.text : 'Select...';
    triggerText.textContent = initialText;
    if (!select.value) {
      triggerText.classList.add('placeholder');
    }

    const arrow = document.createElement('span');
    arrow.className = 'trigger-arrow';
    arrow.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    trigger.appendChild(triggerText);
    trigger.appendChild(arrow);
    wrapper.appendChild(trigger);

    const dropdown = document.createElement('div');
    dropdown.className = 'clout-select-dropdown';

    Array.from(select.options).forEach((opt, idx) => {
      // If empty value and first item, treat as placeholder header or option
      const optionEl = document.createElement('div');
      optionEl.className = 'clout-select-option';
      if (select.value === opt.value) {
        optionEl.classList.add('is-selected');
      }

      const optLabel = document.createElement('span');
      optLabel.textContent = opt.text;
      optionEl.appendChild(optLabel);

      if (select.value === opt.value && opt.value !== '') {
        const check = document.createElement('span');
        check.className = 'option-check';
        check.textContent = '✓';
        optionEl.appendChild(check);
      }

      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));

        triggerText.textContent = opt.text;
        if (!opt.value) {
          triggerText.classList.add('placeholder');
        } else {
          triggerText.classList.remove('placeholder');
        }

        dropdown.querySelectorAll('.clout-select-option').forEach(el => {
          el.classList.remove('is-selected');
          const ck = el.querySelector('.option-check');
          if (ck) ck.remove();
        });

        optionEl.classList.add('is-selected');
        if (opt.value !== '') {
          const check = document.createElement('span');
          check.className = 'option-check';
          check.textContent = '✓';
          optionEl.appendChild(check);
        }

        closeAllDropdowns();
      });

      dropdown.appendChild(optionEl);
    });

    wrapper.appendChild(dropdown);
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) {
        wrapper.classList.add('is-open');
      }
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.classList.toggle('is-open');
      } else if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });
  });

  document.addEventListener('click', () => {
    closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.clout-custom-select-wrap.is-open').forEach(w => {
    w.classList.remove('is-open');
  });
}

'use strict';

// Page Studio content: elements in a page template carry data-cms="section.field".
// Saved edits live in cmsStore page "studio-<page>" under the "fields" section as
// { "section.field": value }. A null value means "use the original from the template".
// Pages with no saved edits are sent exactly as rendered.

const cmsStore = require('../db/cmsStore');

const studioSlug = (page) => `studio-${page}`;

function getEdits(page) {
  const fields = (cmsStore.getPageContent(studioSlug(page)) || {}).fields || {};
  const edits = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && value !== undefined) edits[key] = value;
  }
  return edits;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Plain text -> HTML; new lines become <br>
const textToHtml = (text) => escapeHtml(text).replace(/\r?\n/g, '<br>');
// One item per line -> <li> items
const listToHtml = (text) => String(text).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  .map(item => `<li>${escapeHtml(item)}</li>`).join('');

// Only allow site-relative image paths or http(s) URLs
const safeImageUrl = (url) => (/^(\/(?!\/)|https?:\/\/)[^"<>\s]*$/i.test(String(url).trim()) ? String(url).trim() : null);

function applyEdits(html, edits) {
  const keys = Object.keys(edits);
  if (!keys.length) return html;

  for (const key of keys) {
    const marker = `data-cms="${key}"`;
    let from = 0;
    let idx;
    while ((idx = html.indexOf(marker, from)) !== -1) {
      const tagStart = html.lastIndexOf('<', idx);
      const openEnd = html.indexOf('>', idx);
      const tagName = (html.slice(tagStart + 1).match(/^([a-zA-Z0-9]+)/) || [])[1];
      if (tagStart === -1 || openEnd === -1 || !tagName) { from = idx + marker.length; continue; }
      const openTag = html.slice(tagStart, openEnd + 1);
      const type = (openTag.match(/data-cms-type="([^"]+)"/) || [])[1] || 'text';

      if (type === 'image') {
        const url = safeImageUrl(edits[key]);
        let newTag = openTag;
        if (url) {
          newTag = openTag
            .replace(/\s(srcset|sizes)="[^"]*"/g, '')
            .replace(/\ssrc="[^"]*"/, ` src="${escapeHtml(url)}"`);
          html = html.slice(0, tagStart) + newTag + html.slice(openEnd + 1);
        }
        from = tagStart + newTag.length; // continue after this tag
        continue;
      }

      // find the matching closing tag (same tag name, counting nesting)
      const re = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');
      re.lastIndex = openEnd + 1;
      let depth = 1;
      let m;
      let closeStart = -1;
      while ((m = re.exec(html))) {
        depth += m[1] ? -1 : 1;
        if (depth === 0) { closeStart = m.index; break; }
      }
      if (closeStart === -1) { from = openEnd + 1; continue; }

      const inner = type === 'list' ? listToHtml(edits[key]) : textToHtml(edits[key]);
      html = html.slice(0, openEnd + 1) + inner + html.slice(closeStart);
      from = openEnd + 1;
    }
  }
  return html;
}

// res.render replacement for pages the studio can edit
function renderWithEdits(res, view, data, page) {
  res.render(view, data, (err, html) => {
    if (err) {
      if (res.req && typeof res.req.next === 'function') return res.req.next(err);
      console.error(err);
      return res.status(500).send('Server error');
    }
    let out = html;
    // the studio asks for the untouched template (to know each item's original) — admins only
    const req = res.req || {};
    const wantsOriginal = req.query && req.query.studio === 'original' && req.session && req.session.user;
    if (wantsOriginal) return res.set('Cache-Control', 'no-store').send(html);
    try { out = applyEdits(html, getEdits(page)); } catch (e) { console.warn('Studio edits not applied:', e.message); }
    res.send(out);
  });
}

module.exports = { studioSlug, getEdits, applyEdits, renderWithEdits };

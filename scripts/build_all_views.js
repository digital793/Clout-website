'use strict';

const fs = require('fs');
const path = require('path');

const srcDir = 'f:/Cloutgency/cloutgency.webflow';
const outViewsDir = 'f:/Cloutgency/views';
const publicCssPagesDir = 'f:/Cloutgency/public/css/pages';
const publicJsPagesDir = 'f:/Cloutgency/public/js/pages';

const pageMappings = [
  // Core pages
  { src: 'index.html', dest: 'index.ejs', name: 'index', isSub: false },
  { src: 'about-us.html', dest: 'about-us.ejs', name: 'about-us', isSub: false },
  { src: 'our-services.html', dest: 'our-services.ejs', name: 'our-services', isSub: false },
  { src: 'our-works.html', dest: 'our-works.ejs', name: 'our-works', isSub: false },
  { src: 'contact-us.html', dest: 'contact-us.ejs', name: 'contact-us', isSub: false },
  { src: 'careers.html', dest: 'careers.ejs', name: 'careers', isSub: false },
  { src: 'blog.html', dest: 'blog.ejs', name: 'blog', isSub: false },
  { src: '404.html', dest: '404.ejs', name: '404', isSub: false },
  { src: '401.html', dest: '401.ejs', name: '401', isSub: false },

  // Career Sub-pages
  { src: 'careers-internship.html', dest: 'careers/internship.ejs', name: 'careers-internship', isSub: true },
  { src: 'careers-apply-job.html', dest: 'careers/apply-job.ejs', name: 'careers-apply-job', isSub: true },
  { src: 'careers-content-creator-intern.html', dest: 'careers/content-creator-intern.ejs', name: 'careers-content-creator-intern', isSub: true },
  { src: 'careers-content-writer-intern.html', dest: 'careers/content-writer-intern.ejs', name: 'careers-content-writer-intern', isSub: true },
  { src: 'careers-graphic-designer-intern.html', dest: 'careers/graphic-designer-intern.ejs', name: 'careers-graphic-designer-intern', isSub: true },
  { src: 'careers-junior-graphic-designer.html', dest: 'careers/junior-graphic-designer.ejs', name: 'careers-junior-graphic-designer', isSub: true },
  { src: 'careers-product-manager-intern.html', dest: 'careers/product-manager-intern.ejs', name: 'careers-product-manager-intern', isSub: true },
  { src: 'careers-project-manager-intern.html', dest: 'careers/project-manager-intern.ejs', name: 'careers-project-manager-intern', isSub: true },
  { src: 'careers-sales-intern.html', dest: 'careers/sales-intern.ejs', name: 'careers-sales-intern', isSub: true },
  { src: 'careers-video-editor-intern.html', dest: 'careers/video-editor-intern.ejs', name: 'careers-video-editor-intern', isSub: true },
  { src: 'web-development-intern.html', dest: 'careers/web-development-intern.ejs', name: 'careers-web-development-intern', isSub: true },
  { src: 'careers-apply-web-internship.html', dest: 'careers/apply-web-internship.ejs', name: 'careers-apply-web-internship', isSub: true },
  { src: 'graphic-designer.html', dest: 'careers/graphic-designer.ejs', name: 'careers-graphic-designer', isSub: true },
  { src: 'video-editor.html', dest: 'careers/video-editor.ejs', name: 'careers-video-editor', isSub: true },
];

// ─── Script Filter Logic ─────────────────────────────────────────────────────
// External script URLs that are already included globally (footer.ejs / head.ejs)
const globalExternalScriptUrls = [
  'jquery',
  'webflow.js',
  'cdn.prod.website-files.com/gsap',
  'd3e54v103j8qbb.cloudfront.net',
  'gallabox.com',
  'waw.gallabox.com',
  'disable-hubspot',
  'hs-scripts.com',
  'googletagmanager.com',
  'google-analytics',
  'googleapis.com/ajax/libs/webfont',
  'reb2b',
  'flowbase-co/boosters-custom-slider',  // included via index & about-us extraScripts where needed
];

// Patterns that identify a PURELY boilerplate inline script (whole script is just this)
const pureBoilerplatePatterns = [
  /^\s*gsap\.registerPlugin\s*\(/,          // gsap.registerPlugin(...) only
  /^\s*WebFont\.load\s*\(/,                  // WebFont loader only
  /^\s*!function\s*\(o,c\)\{var n=c\.documentElement/, // w-mod-js detector
];

// Substrings that identify a globally-handled boilerplate inline script
const globalInlineSignatures = [
  'getElementById("toTopBtn")',
  "getElementById('toTopBtn')",
  'w.gbwawc = {',
  'waw.gallabox.com',
];

/**
 * Returns true if this <script> tag should be EXCLUDED from page-specific extraScripts
 * (because it is already handled globally in footer.ejs or head.ejs)
 */
function isCommonScript(scriptTag) {
  // External script: match by URL
  const srcMatch = scriptTag.match(/src=["']([^"']+)["']/i);
  if (srcMatch) {
    const url = srcMatch[1].toLowerCase();
    return globalExternalScriptUrls.some(pattern => url.includes(pattern.toLowerCase()));
  }

  // Inline script: extract code
  const code = scriptTag
    .replace(/<script[^>]*>/i, '')
    .replace(/<\/script>/i, '')
    .trim();

  // Filter if the ENTIRE script is pure framework boilerplate
  if (pureBoilerplatePatterns.some(p => p.test(code))) return true;

  // Filter if the script contains globally-handled widget signatures
  // but ONLY if it doesn't have substantial custom DOM logic as well
  const hasGlobalSig = globalInlineSignatures.some(sig => code.includes(sig));
  if (hasGlobalSig) {
    // Check if this is JUST the widget / toTopBtn script (no other custom logic)
    const linesOfCode = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
    if (linesOfCode < 30) return true; // small boilerplate-only script
  }

  return false;
}

// ─── Style Filter ─────────────────────────────────────────────────────────────
// Only exclude global base styles already included in head.ejs
const standardHeadSignatures = [
  'select {',
  'font-smoothing',
];

// ─── URL Sanitizer ────────────────────────────────────────────────────────────
function sanitizeUrls(html) {
  return html
    // Internal HTML page links
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="about-us\.html"/g, 'href="/about-us"')
    .replace(/href="about-us-2\.html"/g, 'href="/about-us"')
    .replace(/href="\/about-us-2"/g, 'href="/about-us"')
    .replace(/href="our-services\.html"/g, 'href="/our-services"')
    .replace(/href="our-works\.html"/g, 'href="/our-works"')
    .replace(/href="contact-us\.html"/g, 'href="/contact-us"')
    .replace(/href="contact-us-2\.html"/g, 'href="/contact-us"')
    .replace(/href="careers\.html"/g, 'href="/careers"')
    .replace(/href="blog\.html"/g, 'href="/blog"')
    .replace(/href="old-home\.html"/g, 'href="/"')
    .replace(/href="old-home-2\.html"/g, 'href="/"')
    .replace(/href="careers-apply-job\.html"/g, 'href="/careers/apply-job"')
    .replace(/href="careers-internship\.html"/g, 'href="/careers/internship"')
    .replace(/href="careers-([a-zA-Z0-9-]+)\.html"/g, 'href="/careers/$1"')
    .replace(/href="web-development-intern\.html"/g, 'href="/careers/web-development-intern"')
    .replace(/href="graphic-designer\.html"/g, 'href="/careers/graphic-designer"')
    .replace(/href="video-editor\.html"/g, 'href="/careers/video-editor"')

    // Relative asset links → absolute
    .replace(/src="images\//g, 'src="/images/')
    .replace(/srcset="images\//g, 'srcset="/images/')
    .replace(/src="videos\//g, 'src="/videos/')
    .replace(/data-video-urls="videos\//g, 'data-video-urls="/videos/')
    .replace(/data-poster-url="videos\//g, 'data-poster-url="/videos/')
    .replace(/src="documents\//g, 'src="/documents/')
    .replace(/href="documents\//g, 'href="/documents/')
    .replace(/url\(&quot;images\//g, 'url(&quot;/images/')
    .replace(/url\(&quot;videos\//g, 'url(&quot;/videos/')
    .replace(/url\(&quot;fonts\//g, 'url(&quot;/fonts/')
    .replace(/url\(images\//g, 'url(/images/')
    .replace(/url\(videos\//g, 'url(/videos/')
    .replace(/url\(fonts\//g, 'url(/fonts/')
    .replace(/url\(\'images\//g, "url('/images/")
    .replace(/url\(\'videos\//g, "url('/videos/")
    .replace(/url\(\'fonts\//g, "url('/fonts/");
}

// ─── Build Each Page ──────────────────────────────────────────────────────────
pageMappings.forEach(page => {
  const srcFile = path.join(srcDir, page.src);
  if (!fs.existsSync(srcFile)) {
    console.error('File not found:', srcFile);
    return;
  }
  let content = fs.readFileSync(srcFile, 'utf8');

  // Extract Webflow data-wf-page ID
  const pageMatch = content.match(/data-wf-page=["']([^"']+)["']/i);
  const wfPage = pageMatch ? pageMatch[1] : '';

  // Strip Webflow internal password placeholders that break EJS
  content = content.replace(/<\%WF_FORM_VALUE_PATH\%>/g, '').replace(/<\%WF_FORM_VALUE_PAGE\%>/g, '');

  // Extract bodyClass
  const bodyMatch = content.match(/<body[^>]*class=["']([^"']*)["']/i);
  const bodyClass = bodyMatch ? bodyMatch[1] : '';

  // ── Extract page-specific head <style> blocks (Webflow IX2 initial states) ──
  const headEndIdx = content.indexOf('</head>');
  const headContent = headEndIdx !== -1 ? content.substring(0, headEndIdx) : '';
  const headStyles = headContent.match(/<style[\s\S]*?<\/style>/gi) || [];
  const customHeadStyles = headStyles.filter(s => !standardHeadSignatures.some(sig => s.includes(sig)));

  let extraHeadHtml = '';
  if (customHeadStyles.length > 0) {
    const rawCss = customHeadStyles.map(s => s.replace(/<style>/gi, '').replace(/<\/style>/gi, '')).join('\n\n');
    const cleanCss = sanitizeUrls(rawCss);
    const cssFileName = `${page.name}.css`;
    fs.writeFileSync(path.join(publicCssPagesDir, cssFileName), cleanCss, 'utf8');
    extraHeadHtml = `<link href="/css/pages/${cssFileName}" rel="stylesheet" type="text/css">`;
  }

  // ── Extract body content and custom scripts ──────────────────────────────────
  let bodyContent = '';
  let customScripts = [];

  if (page.src === 'contact-us.html') {
    const contactStartIdx = content.indexOf('<section class="section-45">');
    const footerIdx = content.indexOf('<section class="footer-v2">');
    if (contactStartIdx !== -1 && footerIdx !== -1) {
      bodyContent = content.substring(contactStartIdx, footerIdx).replace(/<\/section>\s*<section>\s*$/i, '').trim();
    }
    if (footerIdx !== -1) {
      const afterFooter = content.substring(footerIdx);
      const scripts = afterFooter.match(/<script[\s\S]*?<\/script>/gi) || [];
      customScripts = scripts.filter(s => !isCommonScript(s));
    }

  } else if (page.src === '404.html') {
    const sectionStart = content.indexOf('<section');
    const sectionEnd = content.lastIndexOf('</section>');
    if (sectionStart !== -1 && sectionEnd !== -1) {
      bodyContent = content.substring(sectionStart, sectionEnd + '</section>'.length).trim();
    }

  } else if (page.src === '401.html') {
    const sectionStart = content.indexOf('<div class="utility-page-wrap">') !== -1
      ? content.indexOf('<div class="utility-page-wrap">')
      : content.indexOf('<section');
    const sectionEnd = content.indexOf('<script src="https://d3e54v103j8qbb');
    if (sectionStart !== -1 && sectionEnd !== -1) {
      bodyContent = content.substring(sectionStart, sectionEnd).trim();
    }

  } else {
    // Standard pages: content between end of navbar section and start of footer-v2
    const navEndIdx = content.indexOf('</section>');
    const footerIdx = content.indexOf('<section class="footer-v2">');

    if (navEndIdx !== -1 && footerIdx !== -1) {
      bodyContent = content.substring(navEndIdx + '</section>'.length, footerIdx).trim();
    } else if (navEndIdx !== -1) {
      const altFooterIdx = content.indexOf('<section class="footer_v2"');
      if (altFooterIdx !== -1) {
        bodyContent = content.substring(navEndIdx + '</section>'.length, altFooterIdx).trim();
      }
    }

    if (footerIdx !== -1) {
      const afterFooter = content.substring(footerIdx);
      const scripts = afterFooter.match(/<script[\s\S]*?<\/script>/gi) || [];
      customScripts = scripts.filter(s => !isCommonScript(s));
    }
  }

  // ── Separate external vs inline script content ───────────────────────────────
  let externalScriptTags = [];
  let inlineJsCodes = [];

  customScripts.forEach(s => {
    const srcMatch = s.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      externalScriptTags.push(s);
    } else {
      const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      if (code) inlineJsCodes.push(code);
    }
  });

  let extraScriptsHtml = '';
  if (externalScriptTags.length > 0) {
    extraScriptsHtml += externalScriptTags.join('\n') + '\n';
  }

  if (inlineJsCodes.length > 0) {
    const jsFileName = `${page.name}.js`;
    const fullJsCode = inlineJsCodes.join('\n\n');
    fs.mkdirSync(publicJsPagesDir, { recursive: true });
    fs.writeFileSync(path.join(publicJsPagesDir, jsFileName), sanitizeUrls(fullJsCode), 'utf8');
    extraScriptsHtml += `<script src="/js/pages/${jsFileName}"></script>`;
  }

  // ── Sanitize and escape body ─────────────────────────────────────────────────
  let cleanBody = sanitizeUrls(bodyContent);
  // Escape any accidental <% or %> in body (e.g. from encoded attributes or text)
  cleanBody = cleanBody.replace(/<\%(?![=_-])/g, '&lt;%');

  const partialsPrefix = page.isSub ? '../partials' : 'partials';
  const includeNav = page.src !== '404.html' && page.src !== '401.html';

  const ejsContent = `<%- include('${partialsPrefix}/head', {
  title,
  meta,
  currentPath,
  wfPage: '${wfPage}',
  bodyClass: '${bodyClass}',
  extraHead: ${JSON.stringify(extraHeadHtml)}
}) %>

${includeNav ? `<%- include('${partialsPrefix}/navbar') %>\n` : ''}
${cleanBody}

<%- include('${partialsPrefix}/footer', {
  extraScripts: ${JSON.stringify(extraScriptsHtml)}
}) %>
`;

  const destPath = path.join(outViewsDir, page.dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, ejsContent, 'utf8');
  console.log(`Generated: ${page.dest} | wfPage: ${wfPage} | customScripts: ${customScripts.length}`);
});

console.log('\n✅ All views re-generated with Webflow IX2 + custom interaction bindings!');

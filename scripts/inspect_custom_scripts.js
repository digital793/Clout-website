const fs = require('fs');
const path = require('path');

const commonSignatures = [
  'jquery', 'webflow.js', 'gsap', 'toTopBtn', 'gbwawc', 'gallabox',
  'disable-hubspot', 'hs-scripts', 'google-analytics', 'googletagmanager'
];

function isCommon(script) {
  return commonSignatures.some(sig => script.toLowerCase().includes(sig.toLowerCase()));
}

['index.html', 'about-us.html', 'our-services.html', 'our-works.html', 'contact-us.html', 'careers.html', 'blog.html'].forEach(filename => {
  const filePath = path.join('f:/Cloutgency/cloutgency.webflow', filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const footerIdx = content.indexOf('<section class="footer-v2">');
  const afterFooter = content.substring(footerIdx);

  const scripts = afterFooter.match(/<script[\s\S]*?<\/script>/gi) || [];
  const custom = scripts.filter(s => !isCommon(s));
  console.log(`\n=== ${filename}: ${custom.length} custom scripts ===`);
  custom.forEach((s, idx) => {
    console.log(`[${idx}]`, s.substring(0, 80).replace(/\s+/g, ' '));
  });
});

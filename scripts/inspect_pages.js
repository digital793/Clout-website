const fs = require('fs');
const path = require('path');

const srcDir = 'f:/Cloutgency/cloutgency.webflow';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

console.log('Total HTML files:', files.length);

files.forEach(f => {
  const content = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const hasNavbar = content.includes('class="nav_bar"') || content.includes("class='nav_bar'");
  const hasFooterV2 = content.includes('footer-v2') || content.includes('footer_v2');
  const bodyMatch = content.match(/<body[^>]*class=["']([^"']*)["']/i);
  const bodyClass = bodyMatch ? bodyMatch[1] : '(none)';
  console.log(`${f.padEnd(35)} | nav: ${String(hasNavbar).padEnd(5)} | footer: ${String(hasFooterV2).padEnd(5)} | body: ${bodyClass}`);
});

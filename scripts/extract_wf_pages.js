const fs = require('fs');
const path = require('path');

const srcDir = 'f:/Cloutgency/cloutgency.webflow';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

const mapping = {};
files.forEach(f => {
  const content = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const pageMatch = content.match(/data-wf-page=["']([^"']+)["']/i);
  const siteMatch = content.match(/data-wf-site=["']([^"']+)["']/i);
  if (pageMatch) {
    mapping[f] = { pageId: pageMatch[1], siteId: siteMatch ? siteMatch[1] : '6673e4712b03e7dafbd1ccf5' };
  }
});

console.log(JSON.stringify(mapping, null, 2));

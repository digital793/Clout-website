const fs = require('fs');
const content = fs.readFileSync('cloutgency.webflow/index.html', 'utf8');
const allScripts = content.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log('Total scripts in index.html:', allScripts.length);
allScripts.forEach((s, idx) => {
  console.log(`[${idx}]`, s.substring(0, 120).replace(/\s+/g, ' '));
});

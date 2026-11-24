const fs = require('fs');
const path = require('path');

const standardHeadSignatures = [
  'select {',
  'font-smoothing',
  'html.w-mod-js'
];

['index.html', 'about-us.html', 'our-services.html', 'our-works.html', 'contact-us.html', 'careers.html', 'blog.html'].forEach(filename => {
  const filePath = path.join('f:/Cloutgency/cloutgency.webflow', filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const headEndIdx = content.indexOf('</head>');
  const headContent = content.substring(0, headEndIdx);

  const styles = headContent.match(/<style[\s\S]*?<\/style>/gi) || [];
  console.log(`\n=== ${filename}: ${styles.length} styles in head ===`);
  styles.forEach((s, idx) => {
    const isStd = standardHeadSignatures.some(sig => s.includes(sig));
    if (!isStd) {
      console.log(`  [custom style ${idx}]:`, s.substring(0, 100).replace(/\s+/g, ' '));
    }
  });
});

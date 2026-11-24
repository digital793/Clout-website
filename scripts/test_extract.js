const fs = require('fs');
const path = require('path');

function inspectFile(filename) {
  const filePath = path.join('f:/Cloutgency/cloutgency.webflow', filename);
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(`\n=== ${filename} ===`);

  // Find navbar end
  const navEndIdx = content.indexOf('</section>');
  console.log('First </section> index:', navEndIdx);

  // Find footer start
  const footerV2Idx = content.indexOf('<section class="footer-v2">');
  const footerAltIdx = content.indexOf('<section class="footer_v2"');
  const footerWrapIdx = content.indexOf('class="w-layout-blockcontainer footer_wraper');
  console.log('footer-v2:', footerV2Idx, '| footer_v2:', footerAltIdx, '| footer_wraper:', footerWrapIdx);

  // Find jquery / webflow.js
  const jqueryIdx = content.indexOf('jquery-3.5.1');
  console.log('jquery index:', jqueryIdx);

  // Check what comes after jquery & webflow.js
  if (jqueryIdx !== -1) {
    const afterJquery = content.substring(jqueryIdx);
    const scripts = afterJquery.match(/<script[\s\S]*?<\/script>/gi) || [];
    console.log(`Scripts after jquery: ${scripts.length}`);
    scripts.slice(0, 4).forEach((s, idx) => {
      const preview = s.substring(0, 100).replace(/\n/g, ' ');
      console.log(`  script[${idx}]: ${preview}...`);
    });
  }
}

['index.html', 'about-us.html', 'our-services.html', 'our-works.html', 'contact-us.html', 'careers.html', 'blog.html'].forEach(inspectFile);

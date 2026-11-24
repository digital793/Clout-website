const fs = require('fs');
const files = [
  'index.html', 'about-us.html', 'our-services.html', 'our-works.html',
  'contact-us.html', 'careers.html', 'blog.html',
  'careers-internship.html', 'careers-apply-job.html'
];

files.forEach(f => {
  const content = fs.readFileSync('f:/Cloutgency/cloutgency.webflow/' + f, 'utf8');
  const pageMatch = content.match(/data-wf-page=["']([^"']+)["']/i);
  const siteMatch = content.match(/data-wf-site=["']([^"']+)["']/i);
  console.log(f.padEnd(25), 'pageId:', pageMatch ? pageMatch[1] : 'NONE', 'siteId:', siteMatch ? siteMatch[1] : 'NONE');
});

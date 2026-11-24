const http = require('http');
const app = require('../server');

const testRoutes = [
  '/',
  '/about-us',
  '/our-services',
  '/our-works',
  '/contact-us',
  '/careers',
  '/blog',
  '/careers/internship',
  '/careers/apply-job',
  '/careers/apply-web-internship',
  '/careers/content-creator-intern',
  '/careers/content-writer-intern',
  '/careers/graphic-designer-intern',
  '/careers/junior-graphic-designer',
  '/careers/product-manager-intern',
  '/careers/project-manager-intern',
  '/careers/sales-intern',
  '/careers/video-editor-intern',
  '/careers/web-development-intern',
  '/careers/graphic-designer',
  '/careers/video-editor',
  '/404',
  '/401'
];

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}\n`);

  let allPassed = true;

  for (const route of testRoutes) {
    await new Promise((resolve) => {
      http.get(`http://localhost:${port}${route}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const expectedStatus = route === '/404' ? 404 : route === '/401' ? 401 : 200;
          const statusOk = res.statusCode === expectedStatus;
          const hasContent = data.length > 500;
          if (statusOk && hasContent) {
            console.log(`✅ ${route.padEnd(35)} [${res.statusCode}] — ${data.length} bytes`);
          } else {
            console.error(`❌ ${route.padEnd(35)} [${res.statusCode}] — expected ${expectedStatus}, length: ${data.length}`);
            allPassed = false;
          }
          resolve();
        });
      }).on('error', (err) => {
        console.error(`❌ ${route.padEnd(35)} ERROR:`, err.message);
        allPassed = false;
        resolve();
      });
    });
  }

  server.close(() => {
    console.log(`\n========================================`);
    console.log(allPassed ? '🎉 ALL ROUTES PASSED SUCCESSFULLY!' : '⚠️ SOME ROUTES FAILED');
    console.log(`========================================\n`);
    process.exit(allPassed ? 0 : 1);
  });
});

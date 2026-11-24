const http = require('http');
const app = require('../server');

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`API Test running on port ${port}\n`);

  function postJson(urlPath, payload) {
    return new Promise((resolve, reject) => {
      const dataStr = JSON.stringify(payload);
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        });
      });
      req.on('error', reject);
      req.write(dataStr);
      req.end();
    });
  }

  try {
    // 1. Contact Form - missing fields
    const res1 = await postJson('/api/contact', {});
    console.log('Contact invalid check:', res1.status === 400 ? '✅ PASS' : '❌ FAIL', res1.body);

    // 2. Contact Form - invalid email
    const res2 = await postJson('/api/contact', { name: 'Test', email: 'invalid-email', message: 'Hi' });
    console.log('Contact email check:', res2.status === 400 ? '✅ PASS' : '❌ FAIL', res2.body);

    // 3. Apply Form - missing fields
    const res3 = await postJson('/api/apply', {});
    console.log('Apply invalid check:', res3.status === 400 ? '✅ PASS' : '❌ FAIL', res3.body);

  } catch (err) {
    console.error('API Test Error:', err);
  } finally {
    server.close(() => {
      console.log('\nAPI validation tests completed.\n');
    });
  }
});

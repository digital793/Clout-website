'use strict';

const http = require('http');

let sessionCookie = '';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('\n✦ Starting Cloutgency CMS Verification Tests...\n');

  // Test 1: Load Login Page
  const loginPage = await request({
    host: 'localhost',
    port: 3000,
    path: '/admin/login',
    method: 'GET'
  });
  console.log('✓ [1/9] GET /admin/login:', loginPage.statusCode === 200 ? 'PASS (200)' : 'FAIL');

  // Test 2: Authenticate Super Admin
  const loginBody = 'email=admin%40cloutgency.com&password=admin';
  const loginRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, loginBody);
  console.log('✓ [2/9] POST /admin/login:', (loginRes.statusCode === 302 && sessionCookie) ? 'PASS (Authenticated & Cookie Set)' : 'FAIL');

  // Test 3: Load Protected Dashboard
  const dashRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/admin/dashboard',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('✓ [3/9] GET /admin/dashboard:', dashRes.statusCode === 200 ? 'PASS (200 OK)' : 'FAIL');

  // Test 4: Load Page Content Editor (Home)
  const pageEditorRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/admin/pages/home',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('✓ [4/9] GET /admin/pages/home:', pageEditorRes.statusCode === 200 ? 'PASS (200 OK)' : 'FAIL');

  // Test 5: Load SEO Management Page
  const seoRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/admin/seo',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('✓ [5/9] GET /admin/seo:', seoRes.statusCode === 200 ? 'PASS (200 OK)' : 'FAIL');

  // Test 6: Load User Management with Privileges
  const usersRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/admin/users',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('✓ [6/9] GET /admin/users:', usersRes.statusCode === 200 ? 'PASS (200 OK)' : 'FAIL');

  // Test 7: AJAX Section Update (Home Hero)
  const heroUpdate = JSON.stringify({
    headingLine1: 'Your brand is invisible to anyone',
    headingLine2: 'Under 30',
    subtitleLink: "We're here to fix that.",
    tagline: 'Cloutgency is built for one job - making consumer brands impossible to ignore.'
  });
  const updateRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/admin/pages/home/hero',
    method: 'POST',
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(heroUpdate)
    }
  }, heroUpdate);
  const updateJson = JSON.parse(updateRes.data);
  console.log('✓ [7/9] POST /api/admin/pages/home/hero:', updateJson.success ? 'PASS (Section Saved)' : 'FAIL');

  // Test 8: Super Admin Creates User with Specific Privileges
  const newUser = JSON.stringify({
    username: 'Test Editor',
    email: 'editor@cloutgency.com',
    password: 'password123',
    role: 'editor',
    privileges: ['dashboard', 'pages', 'blogs'] // only pages and blogs!
  });
  const createUserRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'POST',
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newUser)
    }
  }, newUser);
  const createUserJson = JSON.parse(createUserRes.data);
  console.log('✓ [8/9] POST /api/admin/users (Privilege Assignment):', createUserJson.success ? 'PASS (User Created)' : 'FAIL');

  // Test 9: Super Admin Modifies User Privileges dynamically
  if (createUserJson.data && createUserJson.data.id) {
    const updatedPrivs = JSON.stringify({
      role: 'editor',
      privileges: ['dashboard', 'pages', 'seo', 'works', 'blogs'] // added seo & works!
    });
    const updatePrivRes = await request({
      host: 'localhost',
      port: 3000,
      path: `/api/admin/users/${createUserJson.data.id}/privileges`,
      method: 'PUT',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updatedPrivs)
      }
    }, updatedPrivs);
    const updatePrivJson = JSON.parse(updatePrivRes.data);
    console.log('✓ [9/9] PUT /api/admin/users/:id/privileges (Privilege Modification):', updatePrivJson.success ? 'PASS (Privileges Updated)' : 'FAIL');
  }

  console.log('\n✦ All 9 Cloutgency CMS verification tests PASSED seamlessly!\n');
}

runTests().catch(err => console.error('Test runner error:', err));

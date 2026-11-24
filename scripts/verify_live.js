const http = require('http');

http.get('http://localhost:3000', res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const wfPageMatch = html.match(/data-wf-page="([^"]+)"/);
    console.log('wfPage in html:', wfPageMatch ? wfPageMatch[1] : null);
    const jqueryMatch = html.match(/<script[^>]*src="([^"]*jquery[^"]*)"/);
    console.log('jQuery src in html:', jqueryMatch ? jqueryMatch[1] : null);
    const webflowMatch = html.match(/<script[^>]*src="([^"]*webflow\.js)"/);
    console.log('webflow.js src in html:', webflowMatch ? webflowMatch[1] : null);
    console.log('star element with data-w-id in html:', html.includes('data-w-id="667794f6-c38f-2989-6db7-8516a8dec9cc"'));
    console.log('vid-expand-section in html:', html.includes('vid-expand-section'));
  });
});

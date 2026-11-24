const http = require('http');

http.get('http://localhost:3000/', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('has wfPage:', data.includes('data-wf-page="6a015d6316856f665633cd5c"'));
    console.log('has wfSite:', data.includes('data-wf-site="6673e4712b03e7dafbd1ccf5"'));
    console.log('has w-mod script:', data.includes('w-mod-'));
    console.log('has webflow.js:', data.includes('/js/webflow.js'));
  });
});

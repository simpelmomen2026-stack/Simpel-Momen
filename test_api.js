const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  const targetUrl = 'https://script.google.com/macros/s/AKfycby-RoYMJq-lFarD4KWcOTrCfTj93xze8ljDhvjGBT2faQ8WsYW0BSdqyPlpWxxg6ieqBg/exec';
  console.log('Testing GET login for dije / 123456 ...');
  const loginGetUrl = `${targetUrl}?action=login&username=dije&password=123456`;
  const resGet = await fetchUrl(loginGetUrl);
  console.log('GET Response:', JSON.stringify(resGet, null, 2));

  console.log('\nTesting GET login for operator01 / 123456 ...');
  const loginGetUrl2 = `${targetUrl}?action=login&username=operator01&password=123456`;
  const resGet2 = await fetchUrl(loginGetUrl2);
  console.log('GET Response 2:', JSON.stringify(resGet2, null, 2));
}

test().catch(console.error);

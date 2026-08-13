const http = require('http');

function get(path){
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '172.30.125.220', port: 3001, path }, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

function post(path, payload){
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '172.30.125.220',
      port: 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let body = '';
      res.on('data', c => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const root = await get('/');
    console.log('ROOT', root.status);
    console.log(root.body.slice(0, 300));

    const api = await post('/api/ai', { message: 'test' });
    console.log('API', api.status);
    console.log(api.body.slice(0, 1000));
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e);
    process.exitCode = 1;
  }
})();

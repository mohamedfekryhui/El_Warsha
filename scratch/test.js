const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const req = https.request('https://localhost:7226/api/doctors', {
  method: 'GET',
  agent: agent
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Sample doctor:', json[0]);
      console.log('All doctors count:', json.length);
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();

const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:5000' });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Frontend proxy listening on port 3000, forwarding to port 5000');
});

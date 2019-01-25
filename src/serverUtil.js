const fs = require('fs');

const getRequest = function(url) {
  if (url == '/') return './public/html/index.html';
  return './public/' + url;
};

const readBody = (req, res, next, sendResponse) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
    next();
  });
};

const handleRequest = function(req, res, next, sendResponse) {
  let request = getRequest(req.url);
  fs.readFile(request, function(err, content) {
    if (err) {
      sendResponse(res, 'not Found', 404);
      return;
    }
    sendResponse(res, content, 200);
  });
};

const logRequest = function(req, res, next, sendResponse) {
  console.log(req.method, req.url);
  next();
};

const readCookies = function(req, res, next, sendResponse) {
  let cookie = req.headers['cookie'];
  if (cookie) {
    let cookies = new Object();
    let [name, value] = cookie.split('=');
    cookies[name] = value;
    req.cookies = cookies;
  }
  next();
};

module.exports = {
  readBody,
  logRequest,
  getRequest,
  readCookies,
  handleRequest
};

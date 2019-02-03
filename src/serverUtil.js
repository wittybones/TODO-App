const fs = require('fs');
const getRequest = function(url) {
  if (url == '/') return './public/html/index.html';
  return './public/' + url;
};

const logRequest = function(req, res, next) {
  console.log(req.method, req.url);
  next();
};

const handleRequest = function(req, res, next) {
  let request = getRequest(req.url);
  fs.readFile(request, function(err, content) {
    if (err) {
      res.write('not Found');
      res.status(404);
      res.end();
      return;
    }
    res.write(content);
    res.end();
  });
};

const readBody = (req, res, next) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
    next();
  });
};

const readCookies = function(req, res, next) {
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
  readCookies,
  logRequest,
  handleRequest
};

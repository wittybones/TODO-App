const App = require('./frameWork.js');
const app = new App();
const fs = require('fs');

const getRequest = function(url) {
  if (url == '/') return './public/html/index.html';
  return './public/html' + url;
};

const sendResponse = function(res, content, status) {
  res.statusCode = status;
  res.write(content);
  res.end();
};

const readBody = (req, res, next) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
    console.log(req.body);
    next();
  });
};

const handleRequest = function(req, res) {
  let request = getRequest(req.url);
  fs.readFile(request, function(err, content) {
    if (err) {
      sendResponse(res, 'not Found', 404);
      return;
    }
    sendResponse(res, content, 200);
  });
};

const logRequest = function(req, res, next) {
  console.log(req.method, req.url);
  next();
};

const signup = function(req, res) {
  console.log('hi');
  res.end();
};

app.use(readBody);
//app.use(logRequest);
app.post('/signup', signup);
app.use(handleRequest);

module.exports = app.handler.bind(app);

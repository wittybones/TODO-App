const App = require('./frameWork.js');
const app = new App();
const fs = require('fs');
const userInfo = require('../public/data/userInfo.json');

const getRequest = function(url) {
  if (url == '/') return './public/html/index.html';
  return './public/html' + url;
};

const sendResponse = function(res, content, status = 200) {
  res.statusCode = status;
  res.write(content);
  res.end();
};

const readBody = (req, res, next) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
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

const parseUserInfo = function(details) {
  let userId = details.split(/&|=/)[1];
  let password = details.split(/&|=/)[3];
  return { userId, password };
};

const redirectToLogin = function(res) {
  res.writeHead(302, {
    Location: '/index.html'
  });
  res.end();
};

const addUserInfo = function(res, userInfo) {
  fs.writeFile('./public/data/userInfo.json', JSON.stringify(userInfo), () => {
    redirectToLogin(res);
  });
};

const handleSignup = function(req, res) {
  let userDetails = parseUserInfo(req.body);
  userInfo.push(userDetails);
  addUserInfo(res, userInfo);
};

app.use(logRequest);
app.use(readBody);
app.post('/signup', handleSignup);
app.use(handleRequest);

module.exports = app.handler.bind(app);

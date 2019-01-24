const App = require('./frameWork.js');
const app = new App();
const fs = require('fs');
const userInfo = require('../public/data/userInfo.json');

const getRequest = function(url) {
  if (url == '/') return './public/html/index.html';
  return './public/html' + url;
};

const readBody = (req, res, next, sendResponse) => {
  let content = '';
  req.on('data', chunk => (content += chunk));
  req.on('end', () => {
    req.body = content;
    console.log(req.body);

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

const handleSignup = function(req, res, next, sendResponse) {
  let userDetails = parseUserInfo(req.body);
  userInfo.push(userDetails);
  addUserInfo(res, userInfo);
};

const validateUser = function(currentUserInfo, userInfo) {
  isCorrectName = currentUserInfo.userId == userInfo.userId;
  isCorrectPassword = currentUserInfo.password == userInfo.password;
  return isCorrectName && isCorrectPassword;
};

const handleUserLogin = function(req, res, next, sendResponse) {
  let currentUserInfo = parseUserInfo(req.body);
  let isValidUser = validateUser.bind(null, currentUserInfo);
  let validUser = userInfo.filter(isValidUser);
  if (validUser.length > 0) {
    if (!req.cookies) {
      res.setHeader('Set-Cookie', 'username=' + currentUserInfo.userId);
    }
    fs.readFile('./public/html/userProfileTemplate.html', 'utf8', function(
      err,
      content
    ) {
      sendResponse(res, content);
    });
    return;
  }
  sendResponse(res, 'login failed');
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

const renderTodoTemplate = function(req, res, next, sendResponse) {
  fs.readFile('./public/html/todoListTemplate.html', 'utf8', function(
    err,
    content
  ) {
    sendResponse(res, content);
  });
};

app.use(logRequest);
app.use(readCookies);
app.use(readBody);
app.post('/public/html/todoListTemplate.html', renderTodoTemplate);
app.post('/login', handleUserLogin);
app.post('/signup', handleSignup);
app.use(handleRequest);

module.exports = { app: app.handler.bind(app), handleRequest };

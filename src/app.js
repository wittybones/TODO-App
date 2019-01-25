const { App } = require('./frameWork.js');
const app = new App();
const fs = require('fs');

const toDoTemplate = fs.readFileSync(
  './public/html/todoListTemplate.html',
  'utf8'
);

const userProfileTemplate = fs.readFileSync(
  './public/html/userProfileTemplate.html',
  'utf8'
);

const loginPageTemplate = fs.readFileSync('./public/html/index.html', 'utf8');

const getRequest = function(url) {
  if (url == '/') return './public/html/index.html';
  return './public/html' + url;
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

const addUserInfo = function(res, userDetails) {
  let userInfo = new Array();
  userInfo.push(userDetails);
  fs.writeFile(
    `./private_data/${userDetails.userId}.json`,
    JSON.stringify(userInfo),
    () => {
      redirectToLogin(res);
    }
  );
};

const handleSignup = function(req, res, next, sendResponse) {
  let userDetails = parseUserInfo(req.body);
  addUserInfo(res, userDetails);
};

const checkUserCredentials = function(userInfo, currentUserInfo) {
  userInfo = JSON.parse(userInfo);
  let password = userInfo[0].password;
  return password == currentUserInfo.password;
};

const setCookies = function(req, res, currentUserInfo) {
  if (!req.cookies) {
    res.setHeader('Set-Cookie', 'username=' + currentUserInfo.userId);
  }
};

const redirectValidUser = function(
  req,
  res,
  currentUserInfo,
  currentUserFileContent,
  sendResponse
) {
  if (checkUserCredentials(currentUserFileContent, currentUserInfo)) {
    setCookies(req, res, currentUserInfo);
    redirectToDashboard(req, res, () => {}, sendResponse);
    return;
  }
  invalidUserError(res, sendResponse);
};

const getUserFileContent = function(
  req,
  res,
  currentUserFile,
  currentUserInfo,
  sendResponse
) {
  fs.readFile(`./private_data/${currentUserFile}`, 'utf8', function(
    err,
    content
  ) {
    redirectValidUser(req, res, currentUserInfo, content, sendResponse);
  });
};

const handleUserLogin = function(req, res, next, sendResponse) {
  let currentUserInfo = parseUserInfo(req.body);
  let currentUserFile = `${currentUserInfo.userId}.json`;
  let userFiles = fs.readdirSync('./private_data');
  if (userFiles.includes(currentUserFile)) {
    getUserFileContent(
      req,
      res,
      currentUserFile,
      currentUserInfo,
      sendResponse
    );
    return;
  }
  invalidUserError(res, sendResponse);
};

const invalidUserError = function(res, sendResponse) {
  let loginTemplateWithErr = loginPageTemplate.replace(
    '______',
    'login failed'
  );
  sendResponse(res, loginTemplateWithErr);
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
  sendResponse(res, toDoTemplate);
};

const redirectToDashboard = function(req, res, next, sendResponse) {
  let userId = req.cookies['username'];
  let userProfileWithName = userProfileTemplate.replace('#userId#', userId);
  sendResponse(res, userProfileWithName);
};

const addUserList = function(req, res, next, sendResponse) {
  let userId = req.cookies['username'];
  let userList = req.body;
  res.end();
};

app.use(logRequest);
app.use(readCookies);
app.use(readBody);
app.post('/todolist', renderTodoTemplate);
app.post('/addUserList', addUserList);
app.get('/showTodo?', redirectToDashboard);
app.post('/login', handleUserLogin);
app.post('/signup', handleSignup);
app.use(handleRequest);

module.exports = {
  app: app.handler.bind(app),
  handleRequest,
  parseUserInfo,
  readBody,
  checkUserCredentials,
  setCookies,
  readCookies
};

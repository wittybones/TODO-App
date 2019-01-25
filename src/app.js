const { App } = require('./frameWork.js');
const app = new App();
const fs = require('fs');
const {
  readBody,
  logRequest,
  readCookies,
  handleRequest
} = require('./serverUtil');

const toDoTemplate = fs.readFileSync(
  './public/html/todoListTemplate.html',
  'utf8'
);

const userProfileTemplate = fs.readFileSync(
  './public/html/userProfileTemplate.html',
  'utf8'
);

const loginPageTemplate = fs.readFileSync('./public/html/index.html', 'utf8');

const parseUserInfo = function(details) {
  let userId = details.split(/&|=/)[1];
  let password = details.split(/&|=/)[3];
  return { userId, password };
};

const redirectToLogin = function(res) {
  res.writeHead(302, {
    Location: '/html/index.html'
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
  if (!req.headers.cookie) {
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
    redirectToDashboard(res, sendResponse, currentUserInfo);
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

const renderTodoTemplate = function(req, res, next, sendResponse) {
  sendResponse(res, toDoTemplate);
};

const redirectToDashboard = function(res, sendResponse, currentUserInfo) {
  let userId = currentUserInfo.userId;
  let userProfileWithName = userProfileTemplate.replace('#userId#', userId);
  sendResponse(res, userProfileWithName);
};

const backToDashboard = function(req, res, next, sendResponse) {
  let userId = req.cookies.username;
  let userProfileWithName = userProfileTemplate.replace('#userId#', userId);
  sendResponse(res, userProfileWithName);
};

const parseUserList = function(listData) {
  let args = {};
  const splitKeyValue = pair => pair.split('=');
  const assignKeyValueToArgs = ([key, value]) => (args[key] = value);
  listData
    .split('&')
    .map(splitKeyValue)
    .forEach(assignKeyValueToArgs);
  console.log(args);
  return args;
};

const usersList = function(req, res, next, sendResponse) {
  let userId = req.cookies.username;
  fs.readFile(`./private_data/${userId}.json`, 'utf8', function(err, content) {
    let userData = JSON.parse(content);
    let userLists = userData.map(x => x.title);
    sendResponse(res, JSON.stringify(userLists));
  });
  return;
};

const addUserList = function(req, res, next, sendResponse) {
  let userList = parseUserList(req.body);
  let currentUserFile = `./private_data/${req.cookies.username}.json`;
  fs.readFile(currentUserFile, 'utf8', function(err, content) {
    let userContent = JSON.parse(content);
    userContent.push(userList);
    fs.writeFile(currentUserFile, JSON.stringify(userContent), () => {
      return;
    });
  });
  usersList(req, res, next, sendResponse);
};

app.use(logRequest);
app.use(readCookies);
app.use(readBody);
app.post('/todolist', renderTodoTemplate);
app.get('/getUserLists', usersList);
app.get('/showTodo?', backToDashboard);
app.post('/login', handleUserLogin);
app.post('/addUserList', addUserList);
app.post('/html/signup', handleSignup);
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

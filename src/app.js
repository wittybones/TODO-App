const { App } = require('./frameWork.js');
const app = new App();
const fs = require('fs');
const {
  readBody,
  logRequest,
  readCookies,
  handleRequest
} = require('./serverUtil');

const { Item, User, List } = require('./user');

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

const handleSignup = function(req, res, next, sendResponse) {
  let { userId, password } = parseUserInfo(req.body);
  let user = new User(userId, password);
  user.writeUserDetailsToFile();
  redirectToLogin(res);
};

const checkUserCredentials = function(userInfo, user) {
  userInfo = JSON.parse(userInfo);
  let password = userInfo.password;
  return password == user.password;
};

const setCookies = function(req, res, user) {
  if (!req.headers.cookie) {
    res.setHeader('Set-Cookie', 'username=' + user.userId);
  }
};

const handleUserLogin = function(req, res, next, sendResponse) {
  let { userId, password } = parseUserInfo(req.body);
  let user = new User(userId, password);
  let userFiles = fs.readdirSync('./private_data');
  let userFileName = user.file.replace('./private_data/', '');
  if (userFiles.includes(userFileName)) {
    callback = function(err, content) {
      if (checkUserCredentials(content, user)) {
        setCookies(req, res, user);
        redirectToDashboard(res, sendResponse, user);
        return;
      } else {
        invalidUserError(res, sendResponse);
      }
    };
    user.getFile(callback);
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

const redirectToDashboard = function(res, sendResponse, user) {
  let userId = user.userId;
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
  return args;
};

const usersList = function(req, res, next, sendResponse) {
  let userId = req.cookies.username;
  let user = new User(userId);
  let lists = user.getListTitles();
  console.log(lists);

  sendResponse(res, JSON.stringify(lists));
};

const addUserList = function(req, res, next, sendResponse) {
  let userList = parseUserList(req.body);
  let userId = req.cookies.username;
  let user = new User(userId);
  let list = new List(userList.title);
  let item = new Item(userList.item1);
  list.addItem(item);
  user.addList(list);
  user.writeListsToFile();
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

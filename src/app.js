const express = require('express');
const app = express();
const fs = require('fs');
const { User, List } = require('./user');
const { readBody, readCookies, logRequest } = require('./serverUtil');
let currentUserFile;

const dashboardTemplate = fs.readFileSync(
  './public/html/dashboard.html',
  'utf8'
);
const loginPageTemplate = fs.readFileSync('./public/html/index.html', 'utf8');

const writeToUserFile = function(res, userId) {
  fs.writeFile(
    `./private_data/${userId}.json`,
    JSON.stringify(currentUserFile),
    () => {
      res.end();
    }
  );
};

const parseUserInfo = function(details) {
  let userId = details.split(/&|=/)[1];
  let password = details.split(/&|=/)[3];
  return { userId, password };
};

const redirectToLogin = function(res) {
  res.redirect('/index.html');
};

const handleSignup = function(req, res) {
  let { userId, password } = parseUserInfo(req.body);
  let user = new User(userId, password, []);
  let userInfo = { userId, password, todoLists: user.todoLists };
  fs.writeFile(
    `./private_data/${user.userId}.json`,
    JSON.stringify(userInfo),
    () => {
      redirectToLogin(res);
    }
  );
};

const checkUserCredentials = function(userInfo, currentUserInfo) {
  userInfo = JSON.parse(userInfo);
  let password = userInfo.password;
  return password == currentUserInfo.password;
};

const setCookies = function(req, res, user) {
  if (!req.headers.cookie) {
    res.setHeader('Set-Cookie', 'username=' + user.userId);
  }
};

const isValidUserFile = function(userId) {
  let userFiles = fs.readdirSync('./private_data');
  return userFiles.includes(`${userId}.json`);
};

const redirectToDashboard = function(res, user) {
  let dashboardTemplateWithName = dashboardTemplate.replace(
    '#userId#',
    user.userId
  );
  res.send(dashboardTemplateWithName);
};

const handleValidUser = function(req, res, user) {
  setCookies(req, res, user);
  redirectToDashboard(res, user);
  return;
};

const validateUser = function(req, res, userFileContent, currentUserInfo) {
  let { userId, password, todoLists } = userFileContent;
  let user = new User(userId, password, todoLists);
  if (user.match(currentUserInfo.password)) {
    handleValidUser(req, res, user);
    return;
  }
  invalidUserError(res);
};

const handleUserLogin = function(req, res) {
  let currentUserInfo = parseUserInfo(req.body);
  if (isValidUserFile(currentUserInfo.userId)) {
    let content = fs.readFileSync(
      `./private_data/${currentUserInfo.userId}.json`,
      'utf8'
    );
    currentUserFile = JSON.parse(content);
    validateUser(req, res, currentUserFile, currentUserInfo);
    return;
  }
  invalidUserError(res);
};

const invalidUserError = function(res) {
  let loginTemplateWithErr = loginPageTemplate.replace(
    '______',
    'login failed'
  );
  res.send(loginTemplateWithErr);
};

const renderLogout = function(req, res) {
  let userId = req.cookies.username;
  console.log(currentUserFile);

  fs.writeFile(
    `./private_data/${userId}.json`,
    JSON.stringify(currentUserFile),
    () => {
      res.setHeader(
        'Set-Cookie',
        'username=; expires=' + new Date().toUTCString()
      );
      redirectToLogin(res);
    }
  );
};

const createUser = function() {
  let { userId, password, todoLists } = currentUserFile;
  let user = new User(userId, password, todoLists);
  return user;
};

const getSelectedList = function(req, res) {
  let user = createUser();
  let list = req.body;
  let selectedList = user.getList(list);
  res.send(JSON.stringify(selectedList));
};

const addList = function(req, res) {
  let { title, description } = JSON.parse(req.body);
  let user = createUser(req, res);
  let list = new List(title, description);
  user.addList(list);
  currentUserFile.todoLists = user.todoLists;
  writeToUserFile(res, user.userId);
};

const loadJson = function(req, res) {
  let user = createUser();
  let listTitles = user.getListTitles();
  res.write(JSON.stringify(listTitles));
  res.end();
};

const addItems = function(req, res) {
  let user = createUser();
  let { itemAttributes, selectedList } = JSON.parse(req.body);
  let { title, description } = user.getList(selectedList);
  let latestList = new List(title, description);
  itemAttributes.map(latestList.addItem.bind(latestList));
  user.removeList(user.getList(selectedList));
  user.addList(latestList);
  currentUserFile.todoLists = user.todoLists;
  writeToUserFile(res, user.userId);
};

const deleteList = function(req, res) {
  let user = createUser();
  let selectedTitle = req.body;
  let selectedList = user.getList(selectedTitle);
  user.removeList(selectedList);
  currentUserFile.todoLists = user.todoLists;
  writeToUserFile(res, user.userId);
};

app.use(logRequest);
app.use(readCookies);
app.use(readBody);
app.post('/login', handleUserLogin);
app.post('/addList', addList);
app.post('/signup', handleSignup);
app.post('/logout', renderLogout);
app.get('/displayList', loadJson);
app.post('/getSelectedList', getSelectedList);
app.post('/addItems', addItems);
app.post('/deleteList', deleteList);
app.use(express.static('public/html'));
app.use(express.static('public/stylesheet'));
app.use(express.static('public/scripts'));

module.exports = {
  app,
  parseUserInfo,
  readBody,
  checkUserCredentials,
  setCookies,
  readCookies
};

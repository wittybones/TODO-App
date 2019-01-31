const { App } = require("./frameWork.js");
const fs = require("fs");
const app = new App();
const {
  readBody,
  logRequest,
  readCookies,
  handleRequest
} = require("./serverUtil");

const { User, List, Item } = require("./user");

const dashboardTemplate = fs.readFileSync(
  "./public/html/dashboard.html",
  "utf8"
);

const loginPageTemplate = fs.readFileSync("./public/html/index.html", "utf8");

const parseUserInfo = function(details) {
  let userId = details.split(/&|=/)[1];
  let password = details.split(/&|=/)[3];
  return { userId, password };
};

const redirectToLogin = function(res) {
  res.writeHead(302, {
    Location: "/html/index.html"
  });
  res.end();
};

const handleSignup = function(req, res, next, sendResponse) {
  let { userId, password } = parseUserInfo(req.body);
  let user = new User(userId, password, []);
  user.writeUserDetailsToFile();
  redirectToLogin(res);
};

const checkUserCredentials = function(userInfo, currentUserInfo) {
  userInfo = JSON.parse(userInfo);
  let password = userInfo.password;
  return password == currentUserInfo.password;
};

const setCookies = function(req, res, user) {
  if (!req.headers.cookie) {
    res.setHeader("Set-Cookie", "username=" + user.userId);
  }
};

const isValidUserFile = function(userId) {
  let userFiles = fs.readdirSync("./private_data");
  return userFiles.includes(`${userId}.json`);
};

const redirectToDashboard = function(res, sendResponse, user) {
  let dashboardTemplateWithName = dashboardTemplate.replace(
    "#userId#",
    user.userId
  );
  sendResponse(res, dashboardTemplateWithName);
};

const handleValidUser = function(req, res, user, sendResponse) {
  setCookies(req, res, user);
  redirectToDashboard(res, sendResponse, user);
  return;
};

const validateUser = function(
  req,
  res,
  userFileContent,
  currentUserInfo,
  sendResponse
) {
  let { userId, password, todoLists } = JSON.parse(userFileContent);
  let user = new User(userId, password, todoLists);
  if (user.match(currentUserInfo.password)) {
    handleValidUser(req, res, user, sendResponse);
    return;
  }
  invalidUserError(res, sendResponse);
};

const handleUserLogin = function(req, res, next, sendResponse) {
  let currentUserInfo = parseUserInfo(req.body);
  let currentUserFile = `./private_data/${currentUserInfo.userId}.json`;
  if (isValidUserFile(currentUserInfo.userId)) {
    fs.readFile(currentUserFile, "utf8", function(err, content) {
      validateUser(req, res, content, currentUserInfo, sendResponse);
    });
    return;
  }
  invalidUserError(res, sendResponse);
};

const invalidUserError = function(res, sendResponse) {
  let loginTemplateWithErr = loginPageTemplate.replace(
    "______",
    "login failed"
  );
  sendResponse(res, loginTemplateWithErr);
};

const renderLogout = function(req, res, next, sendResponse) {
  res.setHeader("Set-Cookie", "username=; expires=" + new Date().toUTCString());
  redirectToLogin(res);
};

const createUser = function(req, res, callback, sendResponse) {
  let userId = req.cookies.username;
  fs.readFile(`./private_data/${userId}.json`, "utf8", function(err, content) {
    let { userId, password, todoLists } = JSON.parse(content);
    let user = new User(userId, password, todoLists);
    callback(req, res, user, sendResponse);
  });
};

const selectList = function(req, res, user, sendResponse) {
  let list = req.body;
  let selectedList = user.getList(list);
  sendResponse(res, JSON.stringify(selectedList));
};

const getSelectedList = function(req, res, next, sendResponse) {
  createUser(req, res, selectList, sendResponse);
};

const addUserList = function(res, content, userList) {
  let { userId, password, todoLists } = JSON.parse(content);
  let user = new User(userId, password, todoLists);
  let list = new List(userList.title, userList.description);
  user.addList(list);
  user.writeUserDetailsToFile();
  res.end();
};

const addList = function(req, res, next, sendResponse) {
  let { title, description } = JSON.parse(req.body);
  let userId = req.cookies.username;
  fs.readFile(`./private_data/${userId}.json`, "utf8", function(err, content) {
    addUserList(res, content, { title, description });
  });
};

const getTitlesList = function(req, res, user, sendResponse) {
  let listTitles = user.getListTitles();
  sendResponse(res, JSON.stringify(listTitles));
};

const loadJson = function(req, res, next, sendResponse) {
  createUser(req, res, getTitlesList, sendResponse);
};

const updateItems = function(req, res, user, sendResponse) {
  let { itemAttributes, selectedList } = JSON.parse(req.body);
  let { title, description } = user.getList(selectedList);
  let latestList = new List(title, description);
  itemAttributes.map(latestList.addItem.bind(latestList));
  user.removeList(user.getList(selectedList));
  user.addList(latestList);
  user.writeUserDetailsToFile();
  res.end();
};

const addItems = function(req, res, next, sendResponse) {
  createUser(req, res, updateItems, sendResponse);
};

const removeList = function(req, res, user, sendResponse) {
  let selectedTitle = req.body;
  let selectedList = user.getList(selectedTitle);
  user.removeList(selectedList);
  user.writeUserDetailsToFile();
  res.end();
};

const deleteList = function(req, res, next, sendResponse) {
  createUser(req, res, removeList, sendResponse);
};

app.use(logRequest);
app.use(readCookies);
app.use(readBody);
app.post("/login", handleUserLogin);
app.post("/addList", addList);
app.post("/html/signup", handleSignup);
app.post("/logout", renderLogout);
app.get("/displayList", loadJson);
app.post("/getSelectedList", getSelectedList);
app.post("/addItems", addItems);
app.post("/deleteList", deleteList);
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

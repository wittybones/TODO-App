const { App } = require("./frameWork.js");
const fs = require("fs");
const app = new App();
const {
  readBody,
  logRequest,
  readCookies,
  handleRequest
} = require("./serverUtil");
let currentUserFile;
const { User, List } = require("./user");

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
  let userInfo = { userId, password, todoLists: user.todoLists };
  fs.writeFile(
    `./private_data/${userId}.json`,
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
  let { userId, password, todoLists } = userFileContent;
  let user = new User(userId, password, todoLists);
  if (user.match(currentUserInfo.password)) {
    handleValidUser(req, res, user, sendResponse);
    return;
  }
  invalidUserError(res, sendResponse);
};

const handleUserLogin = function(req, res, next, sendResponse) {
  let currentUserInfo = parseUserInfo(req.body);
  if (isValidUserFile(currentUserInfo.userId)) {
    let content = fs.readFileSync(
      `./private_data/${currentUserInfo.userId}.json`,
      "utf8"
    );
    currentUserFile = JSON.parse(content);
    validateUser(req, res, currentUserFile, currentUserInfo, sendResponse);
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
  let userId = req.cookies.username;
  console.log(currentUserFile);
  fs.writeFile(
    `./private_data/${userId}.json`,
    JSON.stringify(currentUserFile),
    () => {
      res.setHeader(
        "Set-Cookie",
        "username=; expires=" + new Date().toUTCString()
      );
      redirectToLogin(res);
    }
  );
};

const createUser = function(req, res, sendResponse) {
  console.log(currentUserFile);
  let { userId, password, todoLists } = currentUserFile;
  let user = new User(userId, password, todoLists);
  return user;
};

const getSelectedList = function(req, res, next, sendResponse) {
  let user = createUser(req, res, sendResponse);
  let list = req.body;
  let selectedList = user.getList(list);
  sendResponse(res, JSON.stringify(selectedList));
};

const addList = function(req, res, next, sendResponse) {
  let { title, description } = JSON.parse(req.body);
  let user = createUser(req, res, sendResponse);
  let list = new List(title, description);
  user.addList(list);
  currentUserFile.todoLists = user.todoLists;
  fs.writeFile(
    `./private_data/${userId}.json`,
    JSON.stringify(currentUserFile),
    () => {
      res.end();
    }
  );
};

const loadJson = function(req, res, next, sendResponse) {
  let user = createUser(req, res, sendResponse);
  let listTitles = user.getListTitles();
  sendResponse(res, JSON.stringify(listTitles));
};

const addItems = function(req, res, next, sendResponse) {
  let user = createUser(req, res, sendResponse);
  let { itemAttributes, selectedList } = JSON.parse(req.body);
  let { title, description } = user.getList(selectedList);
  let latestList = new List(title, description);
  itemAttributes.map(latestList.addItem.bind(latestList));
  user.removeList(user.getList(selectedList));
  user.addList(latestList);
  currentUserFile.todoLists = user.todoLists;
  fs.writeFile(
    `./private_data/${user.userId}.json`,
    JSON.stringify(currentUserFile),
    () => {
      res.end();
    }
  );
};

const deleteList = function(req, res, next, sendResponse) {
  let user = createUser(req, res, sendResponse);
  let selectedTitle = req.body;
  let selectedList = user.getList(selectedTitle);
  user.removeList(selectedList);
  currentUserFile.todoLists = user.todoLists;
  fs.writeFile(
    `./private_data/${userId}.json`,
    JSON.stringify(currentUserFile),
    () => {
      res.end();
    }
  );
};

const getRightDiv = function(req, res, next, sendResponse) {
  fs.readFile("./public/html/dashboardRightDiv.html", "utf8", function(
    err,
    content
  ) {
    res.write(content);
    res.end();
  });
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
app.get("/getRightDiv", getRightDiv);
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

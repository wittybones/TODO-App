const logRequest = function(req, res, next) {
  console.log(req.method, req.url);
  next();
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
  logRequest
};

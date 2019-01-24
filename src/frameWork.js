const isMatching = function(req, route) {
  if (route.handler && !(route.method || route.url)) {
    return true;
  }
  if (route.method == req.method && route.url == req.url) {
    return true;
  }
  return false;
};

class App {
  constructor() {
    this.routes = [];
  }

  handler(req, res) {
    let isValidRoute = isMatching.bind(null, req);
    const matchedRoutes = this.routes.filter(isValidRoute);

    let next = () => {
      if (matchedRoutes.length == 0) {
        return;
      }
      let currentRoute = matchedRoutes[0];
      matchedRoutes.shift();
      currentRoute.handler(req, res, next);
    };
    next();
  }

  get(url, handler) {
    this.routes.push({ url, handler, method: 'GET' });
  }

  post(url, handler) {
    this.routes.push({ url, handler, method: 'POST' });
  }

  use(handler) {
    this.routes.push({ handler });
  }
}

module.exports = App;

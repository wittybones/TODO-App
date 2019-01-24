const chai = require('chai');
const { App, sendResponse, isMatching } = require('../src/frameWork.js');
app = new App();

const handleUSEEvents = (req, res, next) => {
  next();
};

const handleEvents = function(req, res) {
  return;
};

describe('app.use ', function() {
  const app = new App();
  app.use(handleUSEEvents);
  it('should push the object with handler only', function() {
    chai.assert.deepEqual(app.routes, [{ handler: handleUSEEvents }]);
  });
});

describe('app.get', function() {
  const app = new App();
  app.get('/', handleEvents);
  it('should push the object with method get and handler', function() {
    chai.assert.deepEqual(app.routes, [
      { method: 'GET', url: '/', handler: handleEvents }
    ]);
  });
});

describe('app.post', function() {
  const app = new App();
  app.post('/', handleEvents);
  it('should push the object with method get and handler', function() {
    chai.assert.deepEqual(app.routes, [
      { method: 'POST', url: '/', handler: handleEvents }
    ]);
  });
});

describe('handleRequest', function() {
  const app = new App();
  let req = {};
  let res = {};
  it('should return if routes array is empty', function() {
    app.routes = [];
    app.handler(req, res);
    chai.assert.deepEqual(app.routes, []);
  });

  it('should return an array of object when given the method GET', function() {
    app.routes = [{ method: 'GET', url: '/', handler: handleEvents }];
    app.handler(req, res);
    chai.assert.deepEqual(app.routes, [
      { method: 'GET', url: '/', handler: handleEvents }
    ]);
  });

  it('should return an array', function() {
    app.routes = [{ method: 'GET', url: '/', handler: handleEvents }];
    let req = { method: 'GET', url: '/', handler: handleEvents };
    app.handler(req, res);
    chai.assert.deepEqual(app.routes, [
      { method: 'GET', url: '/', handler: handleEvents }
    ]);
  });

  it('should return an array', function() {
    app.routes = [{ method: 'POST', url: '/hello/', handler: handleEvents }];
    let req = { method: 'POST', url: 'hello', handler: handleEvents };
    app.handler(req, res);
    chai.assert.deepEqual(app.routes, [
      { method: 'POST', url: '/hello/', handler: handleEvents }
    ]);
  });
});

describe('isMatching', function() {
  it('should return true if the url and method are matching with given conditions', function() {
    let req = { url: '/', method: 'POST' };
    let route = { url: '/', method: 'POST' };
    chai.expect(isMatching(req, route), true);
  });

  it('should return false if the url and method are not matching with given conditions', function() {
    let req = { url: '/', method: 'POST' };
    let route = { url: '/', method: 'GET' };
    chai.expect(isMatching(req, route), false);
  });

  it('should return true if handler is matched', function() {
    let route = { handler: () => {} };
    let req = {};
    chai.expect(isMatching(req, route), true);
  });
});

describe('sendResponse', function() {
  let res = {
    statusCode: 200,
    write: () => {},
    end: () => {
      return;
    }
  };
  it('should write given content and status code to response', function() {
    let content = 'abc';
    let status = 404;
    sendResponse(res, content, status);
    chai.assert.deepEqual(res.statusCode, 404);
  });

  it('should write status code 200 if status code is not given', function() {
    let content = 'abc';
    sendResponse(res, content);
    chai.assert.deepEqual(res.statusCode, 200);
  });
});

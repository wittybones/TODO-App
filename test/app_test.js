const expect = require('chai').expect;
const chai = require('chai');
const {
  handleRequest,
  parseUserInfo,
  readBody,
  checkUserCredentials,
  handleCookies,
  readCookies,
  redirectToLogin
} = require('../src/app');

describe('handleRequest', function() {
  it('should serve home page when request for "/" comes', function() {
    const send = function(res, content, statusCode) {
      expect(statusCode).to.equal(200);
    };
    const res = {};
    const req = { method: 'GET', url: '/' };
    const next = () => {};
    handleRequest(req, res, next, send);
  });

  it('should serve home page when request for "/signUp.html" comes', function() {
    const send = function(res, content, statusCode) {
      expect(statusCode).to.equal(200);
    };
    const res = {};
    const req = { method: 'GET', url: '/signUp.html' };
    const next = () => {};
    handleRequest(req, res, next, send);
  });

  it('should give not found error for invalid url', function() {
    const send = function(res, content, statusCode) {
      expect(statusCode).to.equal(404);
    };
    const res = {};
    const req = { method: 'GET', url: '/anything' };
    const next = () => {};
    handleRequest(req, res, next, send);
  });
});

describe('parseUserInfo', function() {
  it('should return object when single key value pair provided', function() {
    let actual = parseUserInfo('userId=pqr');
    let expected = { userId: 'pqr', password: undefined };
    chai.assert.deepEqual(actual, expected);
  });

  it('should return object of provided credentials', function() {
    let actual = parseUserInfo('name=abc&password=1234');
    let expected = { userId: 'abc', password: '1234' };
    chai.assert.deepEqual(actual, expected);

    actual = parseUserInfo('name=abc&password=1234&confirmPassword=1234');
    expected = { userId: 'abc', password: '1234' };
    chai.assert.deepEqual(actual, expected);
  });
});

describe('readBody', function() {
  it('should read content from request and keep it in req.body', function() {
    const next = function(req, res) {
      expect(req.body).to.equal('hello');
    };
    let req = {
      on: function(end, chunk) {
        req.body = 'hello';
      }
    };
    const res = {};
    readBody(req, res, next);
  });
});

describe('checkUserCredentials', function() {
  it('should return true for valid user', function() {
    let userInfo = JSON.stringify([{ password: '123' }]);
    let currentUserInfo = { password: '123' };
    expect(checkUserCredentials(userInfo, currentUserInfo), true);
  });

  it('should return false for invalid user', function() {
    let userInfo = JSON.stringify([{ password: '123' }]);
    let currentUserInfo = { password: '124' };
    expect(checkUserCredentials(userInfo, currentUserInfo), false);
  });
});

describe('handleCookies', function() {
  it('should set the header in request object when cookie is not present', function() {
    const send = function(res, content, statusCode) {
      expect(res.setHeader()).to.equal('username=mahesh');
    };
    const currentUserInfo = { userId: 'mahesh' };
    const res = {
      setHeader: setCookie => {
        return 'username=mahesh';
      }
    };
    const req = {
      method: 'GET',
      url: '/',
      cookies: undefined
    };
    handleCookies(req, res, currentUserInfo, send);
  });
});
describe('readCookies', function() {
  it('should set the header in request object when cookie is not present', function() {
    const send = function(res, content, statusCode) {
      expect(res.setHeader()).to.equal('username=mahesh');
    };
    const res = {};
    const req = {
      method: 'GET',
      url: '/',
      headers: { cookie: 'username=mahesh' },
      cookies: { username: 'mahesh' }
    };
    const next = () => {};
    readCookies(req, res, next, send);
  });
});

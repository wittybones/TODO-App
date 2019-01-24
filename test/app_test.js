const expect = require('chai').expect;
const chai = require('chai');
const { handleRequest, parseUserInfo } = require('../src/app');

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

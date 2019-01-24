const expect = require('chai').expect;
const { handleRequest } = require('../src/app');

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

const { app } = require('../src/app');
const request = require('supertest');

describe('GET /signUp.html', function() {
  it('should give content type html and staus code 200', function(done) {
    request(app)
      .get('/signup.html')
      .expect('Content-Type', /text\/html/)
      .expect(200, done);
  });
});

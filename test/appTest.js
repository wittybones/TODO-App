const { app } = require("../src/app");
const request = require("supertest");

describe("GET /signUp.html", function() {
  it("should give content type html and staus code 200", function(done) {
    request(app)
      .get("/signup.html")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
});

describe("/signup", function() {
  it("should redirect to login page with Content-Type text/plain", function(done) {
    request(app)
      .post("/signup")
      .send("name=mahesh&password=123")
      .expect("Location", "/index.html")
      .expect("Content-Type", /text\/plain/)
      .expect(302, done);
  });
});

describe("/incorrectURL", function() {
  it("should give 404 not found err", function(done) {
    request(app)
      .get("/badURL")
      .expect("Content-Type", "text/html; charset=utf-8")
      .expect(404, done);
  });
});

describe("/login", function() {
  it("should redirect the valid user to dashboard", function(done) {
    request(app)
      .post("/login")
      .send("userId=gayatri&password=123")
      .expect("Content-Type", "text/html; charset=utf-8")
      .expect(200, done);
  });
});

describe("/login", function() {
  it("should give err for invalid user", function(done) {
    request(app)
      .post("/login")
      .send("userId=arnab&password=456")
      .expect("Content-Type", "text/plain; charset=utf-8")
      .expect("Location", "/")
      .expect(302, done);
  });
});

describe("/displayList", function() {
  it("should return all the todo titles of the pertucular user", function(done) {
    request(app)
      .get("/displayList")
      .expect("Transfer-Encoding", "chunked")
      .expect(200, done);
  });
});

describe("/addList", function() {
  it("should add the list to the user file", function(done) {
    request(app)
      .post("/addList")
      .send('{"title":"first","description":"abc"}')
      .expect(200, done);
  });
});

describe("for fetching files", function() {
  it("should give Content-Type css for css file", function(done) {
    request(app)
      .get("/dashboard.css")
      .expect("Content-Type", "text/css; charset=UTF-8")
      .expect(200, done);
  });

  it("should give Content-Type application/javascript for js file", function(done) {
    request(app)
      .get("/dashboard.js")
      .expect("Content-Type", "application/javascript; charset=UTF-8")
      .expect(200, done);
  });
});

describe("/getSelectedList", function() {
  it("should give details of selected todo", function(done) {
    request(app)
      .post("/getSelectedList")
      .send("first")
      .expect("Content-Type", "text/html; charset=utf-8")
      .expect(200, done);
  });
});

describe("/addItems", function() {
  it("should add items to respective list of user", function(done) {
    request(app)
      .post("/getSelectedList")
      .send(
        "{'selectedList':'first','itemAttributes':'{ 'content': 'item 2', 'id': 2, 'status': 'unchecked' }"
      )
      .expect(200, done);
  });
});

describe("/logout", function() {
  it("should clear cookie and redirect to login page again", function(done) {
    request(app)
      .post("/logout")
      .set("Cookie", ["username=12345667"])
      .expect("Content-Type", "text/plain; charset=utf-8")
      .expect("Location", "/index.html")
      .expect(302, done);
  });
});

describe("/deleteList", function() {
  it("should delete the given todo of user", function(done) {
    request(app)
      .post("/deleteList")
      .send("one")
      .expect(200, done);
  });
});

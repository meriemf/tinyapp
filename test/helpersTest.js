const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return userRandomID', function() {
    assert.equal(getUserByEmail(("user@example.com", testUsers),'userRandomID'));
  });
  it('should return user2RandomID', function() {
    assert.equal(getUserByEmail(("user2@example.com", testUsers),'user2RandomID'));
  });
  it('should return undefined', function() {
    assert.equal(getUserByEmail(("doNotExist@example.com", testUsers),undefined));
  });
  
});

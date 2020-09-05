function emailLookup(email, obj) {
  for (let item in obj) {
    if (obj[item].email === email) {
      return true;
    }
  }
    return false;
  }

const getUserByEmail = function(email, database) {
  for(let item in database) {
    if (database[item].email === email) {
       return database[item].id;
    }
  }
};

module.exports = { emailLookup, getUserByEmail};

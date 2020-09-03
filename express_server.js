const express = require("express");
var cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

const app = express();
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const users = { 
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
}

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  //console.log("random", r);
  return r;
}
function emailLookup(email, obj) {
for (let item in obj) {
  if (obj[item].email === email) {
    return true;
  }
}
  return false;
}
function passwordLookup(email, obj) {
  let rslt = {};

  for (let item in obj) {
    if (obj[item].email === email) {
      let pass = obj[item].password;
      let id = obj[item].id;
      rslt = {pass, id}; 
    }
  }
  return rslt;
}
  

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls", (req, res) => {
  let id = req.cookies["user_id"];
  let templateVars = { urls: urlDatabase, user: users[id] };
  //let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);  
});
app.get("/urls/new", (req, res) => {
  //let templateVars = {username: req.cookies["username"]};
   let id = req.cookies["user_id"];
   let templateVars = {user: users[id]};
   res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  //save shortURL and longURL into urlDatabase
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/u/${key}`);                                 //res.send("Ok");         // Respond with 'Ok' (we will replace this)
 //res.redirect(`/u/${rurlDatabase[key]}`);
});
// app.get("/u/:shortURL", (req, res) => {
//   let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
//   res.render("urls_show", templateVars);
// })
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
  res.redirect(`https://${longURL}`);
});
app.post ("/urls/:shortURL/delete",(req, res) => {
  //remove the url from urlDatabase
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect ("/urls");
})
app.post("/urls/:id", (req, res) => {
  
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
  console.log(req.body);
  //urlDatabase[req.params.id]= variable.id;
})
app.post('/login', (req, res) => {
  let email = req.body.Email;
  let password = req.body.password;
  if (!emailLookup(email, users)) {
    res.statusCode = 403;
    return res.json({
    status: "error"
    })
  } else {
    if (passwordLookup(email, users).pass === password) {
      
      res.cookie ("user_id", users[passwordLookup(email, users).id].id);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      return res.json({
      status: "error"
      })
    }
    // for (let item in users) {
    //   if (users[item].email === email && users[item].password !== password) {
    //     res.statusCode = 403;
    //     return res.json({
    //     status: "error"
    //     })
    //   } else {
    //     res.cookie ("user_id", users[item].id);
    //     res.redirect('/urls');

//      }
  //  }
  }
})
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})
app.get('/register', (req, res) => {
  res.render ('register');
})
app.post("/register", (req, res) => {
// add the new user into the database
  let id = generateRandomString();
  let email = req.body.Email;
  let password = req.body.password;
  //console.log(emailLookup(email, users));
 if (!email || !password || emailLookup(email, users)) {
  res.statusCode = 400;
  return res.json({
    status: "error"
  });
 } else {
  users[id] = {id, email, password};
  console.log(users);
// create cookie with user information
  res.cookie ("user_id", id);
// redirect user to /urls
  res.redirect ("/urls");
 }
})
app.get ('/login', (req, res) => {
res.render ('login')
}) 
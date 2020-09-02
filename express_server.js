const express = require("express");
var cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

const app = express();
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  //console.log("random", r);
  return r;
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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);  
});
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
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
  console.log(urlDatabase);
  res.redirect ("/urls");
})
app.post("/urls/:id", (req, res) => {
  
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
  console.log(req.body);
  //urlDatabase[req.params.id]= variable.id;
  console.log(urlDatabase);
})
app.post('/login', (req, res) => {
  res.cookie("username",req.body.name);
  console.log(req.body.name);
  res.redirect('/urls');
})
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})
app.get('/register', (req, res) => {
  //console.log();
  res.render ('register');
})

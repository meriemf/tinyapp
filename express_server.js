const helper = require ("./helpers");
const express = require("express");
const PORT = 8080; 
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"],
}));

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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "aJ58lW"}
};

function generateRandomString() {                   // Generate a random alphanumeric number
  let r = Math.random().toString(36).substring(7);
  return r;
}
function passwordLookup(email, obj) {              // Return object that contains password and id of user 
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
  
app.get("/", (req, res) => {
  let id = req.session.user_id;
  if (!id) {
    res.redirect ("/login");
  } else {
  res.redirect ("/urls");
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls", (req, res) => {
  
  let id = req.session.user_id;
  if (!id) {
   res.send ("<html>Please log in to see respective URLs</html>");
  } else {
  
    //filter the urls of the user
    let userUrlDB = {};
    for (let item in urlDatabase) {
    let objId = urlDatabase[item].userID;
    if ( objId === id) {
      userUrlDB[item]= urlDatabase[item].longURL;
    }
    }
    let templateVars = { urls: userUrlDB, user: users[id] };
    res.render("urls_index", templateVars);  
  }
  
});

app.get("/urls/new", (req, res) => {

   let id = req.session.user_id;
   if (!id) {
     res.redirect ("/login");
   } else {
     let templateVars = {user: users[id]};
     res.render("urls_new", templateVars);
   }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let id = req.session.user_id;
  if (!id) {
    res.send ("<html>No user is logged in!</html>");

  } else {
    let longURL = urlDatabase[shortURL].longURL;
    if (!longURL) {
      res.send ("<html>The URL dosn't exist in the database</html>");
    } else {
  
      let userID = urlDatabase[shortURL].userID;
      let templateVars = { shortURL: req.params.shortURL, longURL:longURL, user: users[id]};
      if (id !== userID) {
        return res.send("Error, you cannot access this URL! ");
    
      } else {
        res.render("urls_show", templateVars);  
      }
    
    }
  
  }
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  
  let userID = req.session.user_id;
  if (!userID) {
    res.send("<html>Error! please login !</html>");
  } else {
  
    //save shortURL and longURL into urlDatabase
    let key = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[key] = {longURL, userID};
    res.redirect(`/u/${key}`);                                 
  
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.send("<html>URL dosn't exist in the database!</html>");
  } else {
      res.redirect(`https://${longURL}`);
  }
});

app.post ("/urls/:shortURL/delete",(req, res) => {
  
  if (!req.session.user_id) {
    res.send("<html>Error! no user is logged in</html>")
  } else {
    let shortURL = req.params.shortURL;
    let id = urlDatabase[shortURL].userID;
  
    //check if user is allowed to delete
  
    if (req.session.user_id !== id){
      res.send("<html>Error! user is not allowed to delete this URL</html>");
    } else {
      
      //remove the url from urlDatabase
      let shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect ("/urls");  
    }
  }

})

app.post("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (!id) {
    res.send("<html>Error, no user is logged in !</html>");
  } else {
    if (id !== urlDatabase[shortURL].userID ) {
      res.send("<html>Error! the user is not allowed to access this URL!</html>");
    } else {
      let longURL = req.body.longURL;
      urlDatabase[shortURL].longURL = longURL;
      let templateVars = { shortURL: shortURL, longURL: req.body.longURL, user: users[id]};
      res.render("urls_show", templateVars); 
    } 
  }
})

app.post('/login', (req, res) => {
  let email = req.body.Email;
  let password = req.body.password;
  if (!helper.emailLookup(email, users)) {
    res.statusCode = 403;
    return res.json({
    status: "Error, user dosen't exist!!"
    })
  } else {
   let pass =  passwordLookup(email, users).pass;
   let test = bcrypt.compareSync(password, pass) ;
   if (test) {
      req.session.user_id = users[passwordLookup(email, users).id].id;
      res.redirect('/urls');
    } else {
      res.send("<html>Error! wrong password</html>");
    }
  }
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  let id = req.session.user_id;
  if (!id) {
    res.render ('register');
  } else {
    res.redirect("/urls");
  } 
})
app.post("/register", (req, res) => {
  let email = req.body.Email;
  let pass = req.body.password;
  if (!email || !pass || helper.emailLookup(email, users)) {
    res.send("<html>Error! please enter information again</html>") 
  } else {
    // add the new user into the database
    let id = generateRandomString();
    const password = bcrypt.hashSync(pass, 10);
    users[id] = {id, email, password};
    req.session.user_id = id;
    res.redirect ("/urls");
 }
})
app.get ('/login', (req, res) => {
  let id = req.session.user_id;
  if (!id) {

    res.render ('login');

  } else {
    
    res.redirect ("/urls");
 
  }
}) 
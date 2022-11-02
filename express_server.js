const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Generate a random shortURL
const generateRandomString = () => {
  const randomString = Math.random().toString(16).substring(2, 8);
  return randomString;
};

//find a user from the users database using the userEmail
const userLookup = function(users, userEmail) {
  for (const id in users) {
    if(users[id].email === userEmail) {
      return users[id];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  //create object to send variables to an EJS template
  const userId = req.cookies.user_id;
  const templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  if (longURL.includes('http://') ||  longURL.includes('https://')) {
    urlDatabase[shortURL] = req.body.longURL;
  } else {
    urlDatabase[shortURL] = `http://${req.body.longURL}`;
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //create object to send variables to an EJS template
  const userId = req.cookies.user_id;
  const templateVars = { user: users[userId], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (longURL.includes('http://') ||  longURL.includes('https://')) {
    urlDatabase[id] = req.body.longURL;
  } else {
    urlDatabase[id] = `http://${req.body.longURL}`;
  }
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie('username', username);
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const error = '';
  const templateVars = { user: users[userId], error };
  res.render('register', templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  console.log(userLookup(users, userEmail));
  if (!userEmail || !userPassword || userLookup(users, userEmail)) {
    let error = (userLookup(users, userEmail)) ? 'Email already exists!' : 'Email/password cannot be empty!';
    const userId = req.cookies.user_id;
    const templateVars = { user: users[userId], error: error };
    res.status(400).render("register", templateVars);
  } else {
    const newUserId = generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: userEmail,
      password: userPassword
    };
    res.cookie('user_id', newUserId);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
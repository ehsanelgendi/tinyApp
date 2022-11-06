const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");
const methodOverride = require('method-override')

const app = express();
const PORT = 8080; // default port 8080
var cookieSession = require('cookie-session')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
app.use(methodOverride('_method'));

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
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

const urlsForUser = function (id, urlDatabase) {
  let urls = {};
  for (const key in urlDatabase) {
    if(urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key].longURL;
    }
  }
  return urls;
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
  const userId = req.session.user_id;
  
  if(!users[userId]) {
    return res.send("<html><body><h4>Please login first to visit your URLs!</h4></body></html>");
  }
  const templateVars = { user: users[userId], urls: urlsForUser(userId, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  //If the user is not logged in, send error message
  if(!userId) {
    return res.send("<html><body><h4>Please login first to shorten your URL!</h4></body></html>");
  }

  if (longURL.includes('http://') ||  longURL.includes('https://')) {
    urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  } else {
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userId };
  }
  res.redirect(`/urls/${shortURL}`);
});

app.delete("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;

  //check if url does not exist
  if(!urlDatabase[id]) {
    return res.send("<html><body><h4>Sorry, this URL doesn't doesn't exist!</h4></body></html>");
  }

  //If the user is not logged in, send error message
  if(!users[userId]) {
    return res.send("<html><body><h4>Please login first to view your URL!</h4></body></html>");
  }

  //check if the user does not own the URL
  if (userId !== urlDatabase[id].userID) { 
    return res.send("<html><body><h4>Sorry, this shorten URL doesn't belong to you!</h4></body></html>");
  }
  
  delete urlDatabase[id];
  res.redirect('/urls');
  
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: users[userId], urls: urlDatabase };

  //If the user is not logged in, redirect to GET /login
  if(!templateVars["user"]) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //create object to send variables to an EJS template
  const id = req.params.id;
  const userId = req.session.user_id;
  const templateVars = { user: users[userId], id: id, urls: urlDatabase[id] };

  //check if url in not in the database
  if(!urlDatabase[id]) {
    return res.send("<html><body><h4>Sorry, this URL doesn't doesn't exist!</h4></body></html>");
  }

  //If the user is not logged in, send error message
  if(!users[userId]) {
    return res.send("<html><body><h4>Please login first to view your URL!</h4></body></html>");
  }

  //check if the user does not own the URL
  if(userId !== urlDatabase[id].userID) {
    return res.send("<html><body><h4>Sorry, this shorten URL doesn't belong to you!</h4></body></html>");
  }

  res.render("urls_show", templateVars);
});

app.put("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const longURL = req.body.longURL;

  //check if id does not exist
  if(!urlDatabase[id]) {
    return res.send("<html><body><h4>Sorry, this URL doesn't doesnit exist!</h4></body></html>");
  }
  
  //check if the user is not logged in
  if(!users[userId]) {
    return res.send("<html><body><h4>Please login first to edit your URL!</h4></body></html>");
  }

  //if the user does not own the URL
  if(userId !== urlDatabase[id].userID) {
    return res.send("<html><body><h4>Sorry, this shorten URL doesn't belong to you!</h4></body></html>");
  }

  if (longURL.includes("http://") ||  longURL.includes("https://")) {
    urlDatabase[id].longURL = req.body.longURL;
  } else {
    urlDatabase[id].longURL = `http://${req.body.longURL}`;
  }
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  // check if url in not in the db
  if(!urlDatabase[id]) {
    return res.send("<html><body><h4>Shorten URL doesn't exist!</h4></body></html>");
  }
  res.redirect(urlDatabase[id].longURL);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;

  //If the user is logged in, redirect to GET /urls
  if (userId) {
    return res.redirect("/urls");
  }
  const error = "";
  const templateVars = { user: users[userId], error };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserByEmail(users, userEmail);
  const userId = req.session.user_id;
  let error = "";
  
  if (!user) {
    error += "Invalid email/password combination";
    const templateVars = { user: users[userId], error: error };
    return res.status(403).render("login", templateVars);

  }

  if (!bcrypt.compareSync(userPassword, user.password)) {
    error += "Incorrect password";
    const templateVars = { user: users[userId], error: error };
    return res.status(403).render("login", templateVars);
  }

  //res.session("user_id", user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const error = "";
  const templateVars = { user: users[userId], error };
  //If the user is logged in, redirect to GET /urls
  if (userId) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  const user = getUserByEmail(users, userEmail);
  if (!userEmail || !userPassword || user) {
    let error = (user) ? "Email already exists!" : "Email/password cannot be empty!";
    const userId = req.session.user_id;
    const templateVars = { user: users[userId], error: error };
    return res.status(400).render("register", templateVars);
  }

  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: userEmail,
    password: hashedPassword
  };
  req.session.user_id = newUserId;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
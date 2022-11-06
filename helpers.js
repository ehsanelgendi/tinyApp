//Generate a random shortURL
const generateRandomString = () => {
  const randomString = Math.random().toString(16).substring(2, 8);
  return randomString;
};

//find a user from the users database using the userEmail
const getUserByEmail = function(users, userEmail) {
  for (const id in users) {
    if (users[id].email === userEmail) {
      return users[id];
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  let urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key].longURL;
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
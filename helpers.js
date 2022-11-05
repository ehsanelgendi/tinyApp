//find a user from the users database using the userEmail
const getUserByEmail = function(users, userEmail) {
  for (const id in users) {
    if (users[id].email === userEmail) {
      return users[id];
    }
  }
};

module.exports = { getUserByEmail }
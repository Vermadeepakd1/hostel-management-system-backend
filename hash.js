const bcrypt = require("bcrypt");

const password = "admin123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("------------------------------------------");
  console.log("YOUR HASHED PASSWORD:");
  console.log(hash);
  console.log("------------------------------------------");
  console.log("Copy the code above and paste it into your SQL UPDATE query.");
});

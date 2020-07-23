//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
console.log(process.env.SECRET);

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home")
});
app.get("/register", function (req, res) {
  res.render("register")
});
app.get("/Login", function (req, res) {
  res.render("login")
});

app.post("/register", function (req, res) {
  const email = req.body.username;
  const psw = req.body.password;

  const newUser = new User({
    email: email,
    password: psw
  });
  newUser.save()
  res.render("secrets")

});

app.post("/Login", function (req, res) {
  const email = req.body.username;
  const psw = req.body.password;
  User.findOne({ email: email }, function (err, foundUser) {
    if (err)
      console.log(err);
    else {
      if (foundUser) {
        console.log(foundUser.password);
        
        if (foundUser.password === psw)
          res.render("secrets")
        else
          console.log("No matching password!");
      } else {
        console.log("No User found");
      }
    }
  })
});




app.listen(3000, function () {
  console.log("running on port 3000. http://localhost:3000");
})

//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;



const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
// console.log(process.env.SECRET);
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

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

  bcrypt.hash(psw, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: email,
      password: hash
    });
    newUser.save(function (err) {
      if (err)
        console.log(err);
      else
        res.render("secrets")
    })
  });
});

app.post("/Login", function (req, res) {
  const email = req.body.username;
  const psw = req.body.password;

  User.findOne({ email: email }, function (err, foundUser) {
    if (err)
      console.log(err);
    else {
      if (foundUser) {
        // Load hash from your password DB.
        bcrypt.compare(psw, foundUser.password, function (err, result) {
          // result == true
          if (result === true)
            res.render("secrets")
          else
            console.log("no matching password: "+psw);
        });

      } else {
        console.log("No User found");
      }
    }
  })
});




app.listen(3000, function () {
  console.log("running on port 3000. http://localhost:3000");
})

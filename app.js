//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');




const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'Little did I know.',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
// console.log(process.env.SECRET);
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
  res.render("home")
});
app.get("/register", function (req, res) {
  res.render("register")
});
app.get("/Login", function (req, res) {
  res.render("login")
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets")
  } else {
    res.redirect("/login")
  }

});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect('/');
});

app.post("/register", function (req, res) {
  // User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
  //   if (err) {
  //     return res.render('register');
  //   }
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register")
    }
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })
});

app.post("/Login", passport.authenticate('local'), function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  
  res.redirect('/secrets');
  // req.login(user, function (err) {
  //   if (err) {
  //     console.log(err);
  //     res.redirect("/Login")
  //   }
  //   passport.authenticate("local")(req, res, function () {
  //     res.redirect("/secrets")
  //   })
  // });
});




app.listen(3000, function () {
  console.log("running on port 3000. http://localhost:3000");
})

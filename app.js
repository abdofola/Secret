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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate')
const routes = require(__dirname + "/routes");

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

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true }, // values: email address, googleId, facebookId
  password: String,
  provider: String, // values: 'local', 'google', 'facebook'
  email: String,
  // googleId: String,
  // facebookId: String,
  secret: { type: Array, "default": [] }
});
// ********* Add packages to the Schema as plugin************************
userSchema.plugin(passportLocalMongoose, { usernameField: "username" });
userSchema.plugin(findOrCreate);
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate", *******local Strategy********
passport.use(User.createStrategy());

// use serializeUser and deserializeUser for all different strategies.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// ************************* Googl Strategy*****************************
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ username: profile.id },
      {
        provider: "google",
        email: profile._json.email
      },
      function (err, user) {
        return cb(err, user);
      });
    console.log(profile);
  }
));
// ******************* Facebook Strategy ******************************
passport.use(new FacebookStrategy({
  clientID: process.env.APP_ID,
  clientSecret: process.env.APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/secrets",
  profileFields: ["id", "email"]
},
  function (accessToken, refreshToken, profile, done) {
    console.log(profile);

    User.findOrCreate({ username: profile.id },
      {
        provider: "facebook",
        email: profile._json.email
      },
      function (err, user) {
        if (err) {
          return done(err);
        }
        done(null, user);
      });
  }
));
// *************** My app routes ************************************
routes(app, passport, User);

app.listen(3000, function () {
  console.log("running on port 3000. http://localhost:3000");
})

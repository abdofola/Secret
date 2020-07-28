
module.exports = function (app, passport, User) {

    app.get("/", function (req, res) {
        res.render("home")
    });
    // ************** Google route*******************************************
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
    );
    app.get('/auth/google/secrets',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function (req, res) {
            // Successful authentication, redirect secrets.
            res.redirect('/secrets');
        });
    // ****************** Facebook route ********************************************
    app.get('/auth/facebook',
        passport.authenticate('facebook', { scope: ['email'] })
    );
    app.get('/auth/facebook/secrets',
        passport.authenticate('facebook', {
            successRedirect: '/secrets',
            failureRedirect: '/login'
        })
    );

    app.get("/register", function (req, res) {
        res.render("register")
    });
    app.get("/Login", function (req, res) {
        res.render("login")
    });

    app.get("/secrets", function (req, res) {
        User.find({ secret: { $ne: null } }, function (err, foundUsersOfSecret) {
            if (!err)
                if (foundUsersOfSecret)
                    res.render("secrets", { foundUsersOfSecret: foundUsersOfSecret })
                else {
                    console.log("No users with secrets");
                    res.redirect("/submit");
                }
        })

    });

    app.get("/submit", function (req, res) {
        if (req.isAuthenticated()) {
            res.render("submit")
        } else {
            res.redirect("/login")
        }
    });

    app.post("/submit", function (req, res) {
        const userId = req.user.id;
        const submitted_secret = req.body.secret;
        console.log(req.user);

        User.findById(userId, function (err, foundUser) {
            if (!err) {
                if (foundUser) {
                    foundUser.secret.push(submitted_secret);
                    foundUser.save(function () {
                        res.redirect("/secrets")
                    })
                } else {
                    console.log("no matching Uesr Id");
                }
            }
        })
    });

    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post("/register", function (req, res) {
        User.register({ username: req.body.username }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register")
            }
            else {
                passport.authenticate("local")(req, res, function () {
                    User.updateOne({ _id: user._id }, { $set: { provider: "local", email: req.body.username } },
                        (err) => err ? console.log(err) : res.redirect("/secrets")
                    )
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

} 
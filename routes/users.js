const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const {
    loginLimiter,
    signupLimiter,
    googleAuthLimiter
} = require("../rateLimiter.js");


router.route("/signup")
    .get(userController.renderSignupForm)
    .post(signupLimiter, wrapAsync(userController.signupUser));


router.route("/login")
    .get(userController.renderLoginForm)
    .post(loginLimiter, saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login", failureFlash: true
    }), userController.loginUser);


router.route("/logout")
    .get(userController.logout);


router.get("/auth/google", googleAuthLimiter,
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    (req, res) => {
        res.redirect("/");
    }
);


module.exports = router;
const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signupUser));


router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login", failureFlash: true
    }), userController.loginUser);


router.route("/logout")
    .get(userController.logout);


module.exports = router;
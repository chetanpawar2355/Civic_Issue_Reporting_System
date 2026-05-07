const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/users.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const profileController = require("../controllers/profile.js");

router.route("/")
    .get(isLoggedIn, wrapAsync(profileController.showProfile))
    .put(isLoggedIn, wrapAsync(profileController.updateProfile));


router.route("/edit")
    .get(isLoggedIn, wrapAsync(profileController.editProfile));


module.exports = router;
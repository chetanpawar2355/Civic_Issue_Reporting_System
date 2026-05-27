const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listings");
const Review = require("../models/reviews.js");

const wrapAsync = require("../utils/wrapAsync.js");
const mongoose = require("mongoose");

const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const {
    reviewLimiter
} = require("../rateLimiter");


router.route("/")
    .post(isLoggedIn, reviewLimiter, wrapAsync(reviewController.createReview));


router.route("/:reviewId/edit")
    .get(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.renderEditReview));


router.route("/:reviewId")
    .put(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.updateReview))
    .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;
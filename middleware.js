const Listing = require("./models/listings.js");
const Review = require("./models/reviews.js")

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isOwnerOrAdmin = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (
        listing.owner.equals(req.user._id) || 
        req.user.role === "admin"
    ) {
        return next();
    }

    req.flash("error", "You don't have permission");
    res.redirect(`/listings/${id}`);
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);

    // ❗ Check review exist
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    // ❗ Check user logged in
    if (!res.locals.currentUser) {
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }

    // ❗ Check author
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not authorized!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
const Review = require("../models/reviews");
const Listing = require("../models/listings");
const mongoose = require("mongoose");

module.exports.createReview = async (req, res) => {
    console.log(req.user._id);
    let { id } = req.params;

    let listing = await Listing.findById(id);
    let review = new Review(req.body.review);
    review.author = req.user._id;
    console.log(review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}

module.exports.renderEditReview = async (req, res) => {
    let { id, reviewId } = req.params;
    let listing = await Listing.findById(id);
    let review = await Review.findById(reviewId);
    res.render("listings/editReview.ejs", { listing, review });
}

module.exports.updateReview = async (req, res) => {
        let { reviewId, id } = req.params;
        await Review.findByIdAndUpdate(reviewId, {
            comment: req.body.review.comment
        });
        res.redirect(`/listings/${id}`);
    }

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId
        }
    });
    let deletedReview = await Review.findByIdAndDelete(reviewId);
    console.log(deletedReview);
    res.redirect(`/listings/${id}`);
}
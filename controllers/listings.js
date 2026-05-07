const Listing = require("../models/listings");

module.exports.index = async (req, res) => {
    let filter = {};
    if (!req.user) {
        return res.render("listings/listings.ejs", { allListings: [] });
    }
    if (req.user.role === "admin") {
        filter = {};
    }
    else if (req.user.role === "client") {
        filter.owner = req.user._id;
    }
    else if (req.user.role === "employee") {
        filter.assignedTo = req.user._id;
    }
    let allListings = await Listing.find(filter)
        .populate("owner")
        .populate("assignedTo");
    res.render("listings/listings.ejs", { allListings });
}

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;
    await newListing.save();
    res.redirect("/listings");
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    res.redirect(`/listings/${id}`);
    console.log("Data is Edited");
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}
const User = require("../models/users.js");

module.exports.showProfile = async (req, res) => {
    let user = await User.findById(req.user._id);
    res.render("profile/profile.ejs", { user });
}

module.exports.updateProfile = async (req, res) => {
    const { firstName, lastName, username, email, phone } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
        firstName,
        lastName,
        username,
        email,
        phone
    });

    req.flash("success", "Profile updated successfully");
    res.redirect("/profile");
}

module.exports.editProfile = async (req, res) => {
    let user = await User.findById(req.user._id);
    res.render("profile/edit.ejs", { user });
}
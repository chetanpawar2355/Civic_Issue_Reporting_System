const Listing = require("../models/listings.js");
const User = require("../models/users.js");

module.exports.renderDashboard = (req, res) => {
    const role = req.user.role;
    if (role === "admin") {
        return res.redirect("/dashboard/admin");
    }
    if (role === "employee") {
        return res.redirect("/dashboard/employee");
    }
    res.redirect("/");
}

module.exports.renderAdminDashboard = async (req, res) => {
    const issues = await Listing.find({})
        .populate("assignedTo")
        .populate("owner");

    const employees = await User.find({ role: "employee" });
    res.render("dashboard/admin", { issues, employees });
}

module.exports.assignIssueToEmployee = async (req, res) => {
    const { employeeId } = req.body;

    await Listing.findByIdAndUpdate(req.params.id, {
        assignedTo: employeeId,
        status: "assigned",
    });
    res.redirect("/dashboard/admin");
}

module.exports.reviewWork = async (req, res) => {
    const issue = await Listing.findById(req.params.id)
        .populate("assignedTo");

    res.render("dashboard/reviewWork.ejs", { issue });
}

module.exports.approveWork = async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, {
        status: "resolved",
        resolutionDetails: {
            message: "Issue has been successfully resolved",
            resolvedAt: new Date(),
            approvedBy: req.user._id
        }
    });
    res.redirect("/dashboard/admin");
}

module.exports.rejectWork = async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, { status: "pending" });
    res.redirect("/dashboard/admin");
}

module.exports.renderNewEmployee = (req, res) => {
    res.render("dashboard/newEmployee.ejs");
}

module.exports.showAllEmployees = async (req, res) => {
    const employees = await User.find({ role: "employee" });
    res.render("dashboard/allEmployees.ejs", { employees });
}

module.exports.createEmployee = async (req, res) => {
    const { username, email, password, employeeId } = req.body;

    const user = new User({ username, email, employeeId, role: "employee" });
    await User.register(user, password);
    console.log(user);
    res.redirect("/dashboard/admin/employees");
}

module.exports.destroyEmployee = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard/admin/employees");
}

module.exports.renderEmployeeDashboard = async (req, res) => {
    const issues = await Listing.find({
        assignedTo: req.user._id,
    }).populate("owner");
    res.render("dashboard/employee", { issues });
}

module.exports.employeeWorkingRoute = async (req, res) => {

    const { status } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Issue not found");
        return res.redirect("/dashboard/employee");
    }

    if (listing.status === "assigned" && status !== "in-progress") {
        return res.redirect("/dashboard/employee");
    }

    if (listing.status === "in-progress" && status !== "pending-review") {
        return res.redirect("/dashboard/employee");
    }

    if (status === "pending-review" && !req.file) {
        return res.redirect("/dashboard/employee");
    }

    let updateData = { status };

    if (req.file) {
        updateData.resolvedImage = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await Listing.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/dashboard/employee");
}
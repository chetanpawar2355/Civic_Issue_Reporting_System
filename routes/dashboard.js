const express = require("express");
const router = express.Router({ mergeParams: true });

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const dashboardController = require("../controllers/dashboard.js");


router.route("/")
    .get(isLoggedIn, dashboardController.renderDashboard);


router.route("/admin")
    .get(isLoggedIn, isAdmin, wrapAsync(dashboardController.renderAdminDashboard));


router.route("/admin/:id/assign")
    .put(isLoggedIn, isAdmin, wrapAsync(dashboardController.assignIssueToEmployee));


router.route("/admin/:id/review")
    .get(isAdmin, dashboardController.reviewWork);


router.route("/admin/:id/approve")
    .put(isAdmin, wrapAsync(dashboardController.approveWork));


router.route("/admin/:id/reject")
    .put(isAdmin, wrapAsync(dashboardController.rejectWork));


router.route("/admin/newEmployee")
    .get(isAdmin, dashboardController.renderNewEmployee);


router.route("/admin/employees")
    .get(isAdmin, wrapAsync(dashboardController.showAllEmployees))
    .post(isAdmin, wrapAsync(dashboardController.createEmployee));


router.route("/admin/employees/:id")
    .delete(isAdmin, wrapAsync(dashboardController.destroyEmployee));


router.route("/employee")
    .get(isLoggedIn, isEmployee, wrapAsync(dashboardController.renderEmployeeDashboard));


router.route("/employee/:id")
    .put(isEmployee, isLoggedIn, upload.single("resolvedImage"), dashboardController.employeeWorkingRoute);


function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        req.flash("error", "Access Denied! Admin only.");
        return res.redirect("/listings");
    }
    next();
}

function isEmployee(req, res, next) {
    if (req.user.role !== "employee") {
        return res.redirect("/dashboard");
    }
    next();
}

module.exports = router;
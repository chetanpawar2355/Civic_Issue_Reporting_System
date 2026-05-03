if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listings");
const Review = require("./models/reviews.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const { storage } = require("./cloudConfig");
const upload = multer({ storage });
const User = require("./models/users.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { isLoggedIn, isOwner, saveRedirectUrl, isOwnerOrAdmin } = require("./middleware.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);


// Database connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/civicIssues";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("DB is connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}


// Session Configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 60 * 60
});

store.on("error", (err) => {
    console.log("ERROR in MONGODB SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});


app.get("/", wrapAsync(async (req, res) => {
    res.render("listings/index.ejs");
}));

app.get("/listings", wrapAsync(async (req, res) => {
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
}));

app.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

app.post("/listings", isLoggedIn, upload.single("listing[image]"), wrapAsync(async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;
    await newListing.save();
    res.redirect("/listings");
}));

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));


app.get("/listings/:id/edit", isLoggedIn, isOwnerOrAdmin, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));


app.put("/listings/:id", isLoggedIn, isOwnerOrAdmin, upload.single("listing[image]"), wrapAsync(async (req, res) => {
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
}));


app.delete("/listings/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


// login and signup routes
app.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

app.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    } catch (err) {
        res.redirect("/signup");
    }
}));

app.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

app.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login", failureFlash: true
}),
    async (req, res) => {
        let redirectUrl = res.locals.redirectUrl || "/";
        res.redirect(redirectUrl);
    });

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});


// profile route
app.get("/profile", isLoggedIn, wrapAsync(async (req, res) => {
    let user = await User.findById(req.user._id);
    res.render("profile/profile.ejs", { user });
}));

app.get("/profile/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let user = await User.findById(req.user._id);
    res.render("profile/edit.ejs", { user });
}));

app.put("/profile", isLoggedIn, wrapAsync(async (req, res) => {
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
}));

app.get("/dashboard", isLoggedIn, (req, res) => {
    const role = req.user.role;
    if (role === "admin") {
        return res.redirect("/dashboard/admin");
    }
    if (role === "employee") {
        return res.redirect("/dashboard/employee");
    }
    res.redirect("/");
});

app.get("/dashboard/admin", isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const issues = await Listing.find({})
        .populate("assignedTo")
        .populate("owner");

    const employees = await User.find({ role: "employee" });
    res.render("dashboard/admin", { issues, employees });
}));

app.get("/dashboard/employee", isLoggedIn, isEmployee, wrapAsync(async (req, res) => {
    const issues = await Listing.find({
        assignedTo: req.user._id,
    }).populate("owner");
    res.render("dashboard/employee", { issues });
}));


app.put("/dashboard/admin/:id/assign", isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const { employeeId } = req.body;

    await Listing.findByIdAndUpdate(req.params.id, {
        assignedTo: employeeId,
        status: "assigned",
    });

    req.flash("success", "Issue assigned");
    res.redirect("/dashboard/admin");
}));

app.get("/dashboard/admin/:id/review", isAdmin, async (req, res) => {
    const issue = await Listing.findById(req.params.id)
        .populate("assignedTo");

    res.render("dashboard/reviewWork.ejs", { issue });
});

app.put("/dashboard/admin/:id/approve", isAdmin, wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, {
        status: "resolved",
        resolutionDetails: {
            message: "Issue has been successfully resolved",
            resolvedAt: new Date(),
            approvedBy: req.user._id
        }
    });

    req.flash("success", "Issue approved");
    res.redirect("/dashboard/admin");
}));

app.put("/dashboard/admin/:id/reject", isAdmin, wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, { status: "pending" });
    req.flash("success", "Sent back to employee");
    res.redirect("/dashboard/admin");
}));


// Employee routes to update issue status
app.get("/dashboard/admin/newEmployee", isAdmin, (req, res) => {
    res.render("dashboard/newEmployee.ejs");
});

app.get("/dashboard/admin/employees", isAdmin, wrapAsync(async (req, res) => {
    const employees = await User.find({ role: "employee" });
    res.render("dashboard/allEmployees.ejs", { employees });
}));

app.post("/dashboard/admin/employees", isAdmin, wrapAsync(async (req, res) => {
    const { username, email, password, employeeId } = req.body;

    const user = new User({ username, email, employeeId, role: "employee" });
    await User.register(user, password);
    console.log(user);
    req.flash("success", "Employee created");
    res.redirect("/dashboard/admin/employees");
}));

app.delete("/dashboard/admin/employees/:id", isAdmin, wrapAsync(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "Employee deleted");
    res.redirect("/dashboard/admin/employees");
}));

app.put("/dashboard/employee/:id", isEmployee, isLoggedIn, upload.single("resolvedImage"), async (req, res) => {

    const { status } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Issue not found");
        return res.redirect("/dashboard/employee");
    }

    if (listing.status === "assigned" && status !== "in-progress") {
        req.flash("error", "Invalid status change");
        return res.redirect("/dashboard/employee");
    }

    if (listing.status === "in-progress" && status !== "pending-review") {
        req.flash("error", "Invalid status change");
        return res.redirect("/dashboard/employee");
    }

    if (status === "pending-review" && !req.file) {
        req.flash("error", "Image is required before sending for review!");
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

    req.flash("success", "Status updated successfully");
    res.redirect("/dashboard/employee");
});


// review routes
app.post(
    "/listings/:id/reviews", isLoggedIn,
    wrapAsync(async (req, res) => {
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
    }),
);

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


// Error Handling Middleware
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(8080, () => {
        console.log('Server is running on port 8080');
    });
}

module.exports = app;
if(process.env.NODE_ENV != "production") {
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
const { isLoggedIn, isOwner, saveRedirectUrl } = require("./middleware.js");


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

app.get("/listings", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
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


app.get("/listings/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));


app.put("/listings/:id", isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(async (req, res) => {
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


app.delete("/listings/:id", isLoggedIn, isOwner,  wrapAsync(async (req, res) => {
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
            res.redirect("/listings");
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
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    });

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/listings");
    });
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

// Error Handling Middleware
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
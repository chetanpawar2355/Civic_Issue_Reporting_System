if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();

app.set("trust proxy", 1);

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const compression = require("compression");
const User = require("./models/users.js");
const wrapAsync = require("./utils/wrapAsync.js");
const reviewRouter = require("./routes/reviews.js");
const listingRouter = require("./routes/listings.js");
const userRouter = require("./routes/users.js");
const profileRouter = require("./routes/profile.js");
const dashboardRouter = require("./routes/dashboard.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"), {
    maxAge: "7d",
    etag: true
}));
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
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

// All Routes
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings", listingRouter);
app.use("/", userRouter);
app.use("/profile", profileRouter);
app.use("/dashboard", dashboardRouter);


app.get("/", wrapAsync(async (req, res) => {
    res.render("listings/index.ejs");
}));


// Error Handling Middleware
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
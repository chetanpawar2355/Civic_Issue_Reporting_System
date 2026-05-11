const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users");


// LOCAL STRATEGY
passport.use(new LocalStrategy(User.authenticate()));


// GOOGLE STRATEGY
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {

        try {

            // GOOGLE EMAIL
            const email = profile.emails?.[0]?.value;

            // 1. EMAIL CHECK
            if (!email) {
                return done(new Error("Google account email not found"), null);
            }

            // 2. FIND EXISTING USER BY EMAIL
            let user = await User.findOne({ email });

            if (user) {

                // LINK GOOGLE ACCOUNT IF NOT LINKED
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }

                return done(null, user);
            }

            // 3. CREATE UNIQUE USERNAME
            const baseUsername = email.split("@")[0];

            let username = baseUsername;
            let counter = 1;

            // CHECK DUPLICATE USERNAME
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            // 4. CREATE NEW USER
            const newUser = new User({
                googleId: profile.id,
                email: email,
                username: username
            });

            await newUser.save();

            return done(null, newUser);

        } catch (err) {
            return done(err, null);
        }
    }));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
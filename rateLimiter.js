const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many requests from this IP. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});


// LOGIN LIMITER
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Try again after 15 minutes."
});


// SIGNUP LIMITER
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many accounts created. Try later."
});


// GOOGLE AUTH LIMITER
const googleAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many Google authentication attempts."
});


// ISSUE CREATION LIMITER
const createIssueLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Too many issue submissions."
});


// REVIEW LIMITER
const reviewLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 15,
    message: "Too many reviews submitted."
});


module.exports = {
    globalLimiter,
    loginLimiter,
    signupLimiter,
    googleAuthLimiter,
    createIssueLimiter,
    reviewLimiter
};
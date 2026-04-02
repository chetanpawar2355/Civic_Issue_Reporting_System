require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("DB is connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

const sampleListing = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log('data was initialized');
}

sampleListing();
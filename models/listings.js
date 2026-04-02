const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    image: {
        url: String,
        filename: String
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true
    },
    status: {
        type: String,
        enum: [
            "pending",
            "assigned",
            "in-progress",
            "pending-review",
            "resolved",
        ],
        default: "pending",
    }
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
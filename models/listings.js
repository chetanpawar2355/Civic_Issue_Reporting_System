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
    resolvedImage: {
      url: String,
      filename: String,
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
    },
    resolutionDetails: {
        message: String,
        resolvedAt: Date,
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
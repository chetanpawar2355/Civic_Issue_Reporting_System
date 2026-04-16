const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["client", "admin", "employee"],
    default: "client"
  },

  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
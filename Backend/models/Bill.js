const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now, // auto set current date if not provided
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);

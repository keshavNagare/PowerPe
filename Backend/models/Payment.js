const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    billId: {
      type: String, // can be "all" or specific bill _id
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "credit card", "debit card", "upi", "razorpay"], // ✅ add here
      required: true,
    },    
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  { timestamps: true } // gives createdAt (your payment time)
);

module.exports = mongoose.model("Payment", paymentSchema);

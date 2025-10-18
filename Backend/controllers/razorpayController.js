const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Bill = require("../models/Bill");
require("dotenv").config();
const Payment = require("../models/Payment");


// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order API
exports.createOrder = async (req, res) => {
  try {
    const { amount, billId } = req.body;
    const paiseAmount = Math.round(Number(amount) * 100); // Ensure integer
    const options = {
      amount: paiseAmount, // Razorpay needs integer paise
      currency: "INR",
      receipt: `receipt_${billId}`,
    };
    

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId,
    } = req.body;

    console.log("verifyPayment called - body:", {
      razorpay_order_id,
      razorpay_payment_id,
      billId,
      user: req.user?._id,
    });

    // ✅ Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      console.warn("❌ Razorpay signature mismatch");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const userId = req.user._id;

    let updatedBill = null;

    if (billId === "all") {
      // ✅ Update all unpaid bills of this user only
      const updateRes = await Bill.updateMany(
        { user: new mongoose.Types.ObjectId(userId), status: "unpaid" },
        { $set: { status: "paid" } }
      );
      console.log(`✅ Updated ${updateRes.modifiedCount} bills for user ${userId}`);
    } else {
      // ✅ Update only that specific bill belonging to this user
      updatedBill = await Bill.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(billId),
          user: new mongoose.Types.ObjectId(userId),
        },
        { $set: { status: "paid" } },
        { new: true }
      );

      if (!updatedBill) {
        console.warn("⚠️ No bill found for this user:", { billId, userId });
        return res
          .status(404)
          .json({ success: false, message: "Bill not found or not owned by user" });
      }

      console.log(`✅ Bill ${billId} marked paid for user ${userId}`);
    }

    // ✅ Save payment record after successful verification
    await Payment.create({
      user: userId,
      userEmail: req.user.email,
      billId,
      paymentId: razorpay_payment_id,
      amount: billId === "all" ? "Multiple Bills" : updatedBill?.amount || 0,
      method: "razorpay",
      status: "completed",
    });

    // ✅ Send success response
    res.json({ success: true, message: "Payment verified and recorded successfully" });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};


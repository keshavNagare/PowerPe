const Payment = require("../models/Payment");

// Get payments for logged-in customer
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: Create a new payment (if needed)
const createPayment = async (req, res) => {
  try {
    const { amount, method, status } = req.body;
    const payment = new Payment({
      user: req.user._id,
      amount,
      method,
      status: status || "completed",
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyPayments, createPayment };

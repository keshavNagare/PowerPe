// backend/routes/razorpayRoutes.js
const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/razorpayController");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Routes
router.post("/order", protect, allowRoles("customer"), createOrder);
router.post("/verify", protect, allowRoles("customer"), verifyPayment);

module.exports = router;

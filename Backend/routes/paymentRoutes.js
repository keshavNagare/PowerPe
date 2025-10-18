const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getMyPayments } = require("../controllers/paymentController");

// 🧾 Existing route — keep it
// Customer route - get own payments
router.get("/", protect, allowRoles("customer"), getMyPayments);


module.exports = router;

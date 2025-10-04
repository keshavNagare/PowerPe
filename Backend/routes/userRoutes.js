const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const { getMyBills } = require('../controllers/billController');
const consumptionController = require('../controllers/consumptionController');

// Get bills for logged-in customer
router.get('/bills', protect, allowRoles('customer'), getMyBills);

// Get consumption for logged-in customer
router.get('/consumption', protect, allowRoles('customer'), consumptionController.getMyConsumption);

module.exports = router;

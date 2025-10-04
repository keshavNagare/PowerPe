const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Admin routes
router.post('/', protect, allowRoles('admin'), billController.createBill);
router.get('/', protect, allowRoles('admin'), billController.getAllBills);
router.put('/:id', protect, allowRoles('admin'), billController.updateBill);
router.delete('/:id', protect, allowRoles('admin'), billController.deleteBill);

// Customer route - get own bills
router.get('/my', protect, allowRoles('customer'), billController.getMyBills);

module.exports = router;

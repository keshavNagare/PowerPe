const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const billController = require('../controllers/billController');
const User = require('../models/User');

// Fetch all customers
router.get('/customers', protect, allowRoles('admin'), async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('_id name email');
    res.json(customers);
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bills CRUD
router.get('/bills', protect, allowRoles('admin'), billController.getAllBills);
router.post('/bills', protect, allowRoles('admin'), billController.createBill);
router.put('/bills/:id', protect, allowRoles('admin'), billController.updateBill);
router.delete('/bills/:id', protect, allowRoles('admin'), billController.deleteBill);

module.exports = router;

const Bill = require('../models/Bill');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all bills (admin only)
const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate('user', 'name email').sort({ issueDate: -1 });
    res.json(bills);
  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create bill
const createBill = async (req, res) => {
  try {
    const { user, name, units, amount, dueDate } = req.body;

    const newBill = new Bill({
      user,
      name,
      units,
      amount,
      dueDate,
    });

    const savedBill = await newBill.save();
    const populatedBill = await savedBill.populate('user', 'name email');

    res.status(201).json(populatedBill);
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bill
const updateBill = async (req, res) => {
  try {
    const billId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ message: 'Invalid Bill ID' });
    }

    let bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Update Bill fields
    bill.name = req.body.name ?? bill.name;
    bill.units = req.body.units ?? bill.units;
    bill.amount = req.body.amount ?? bill.amount;
    bill.dueDate = req.body.dueDate ?? bill.dueDate;
    bill.status = req.body.status ?? bill.status;

    await bill.save();

    // If admin edited user details
    if (req.body.user && (req.body.user.name || req.body.user.email)) {
      let user = await User.findById(bill.user);
      if (user) {
        if (req.body.user.name) user.name = req.body.user.name;
        if (req.body.user.email) user.email = req.body.user.email;
        await user.save();
      }
    }

    // Return updated bill with populated user
    const updatedBill = await Bill.findById(bill._id).populate('user', 'name email');
    res.json(updatedBill);
  } catch (error) {
    console.error('Update Bill Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete bill
const deleteBill = async (req, res) => {
  try {
    const billId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ message: 'Invalid Bill ID' });
    }

    const deletedBill = await Bill.findByIdAndDelete(billId);
    if (!deletedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json({ message: 'Bill deleted successfully', id: billId });
  } catch (error) {
    console.error('Delete Bill Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bills for logged-in customer
const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id });
    res.json(bills);
  } catch (error) {
    console.error('Get my bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBills,
  createBill,
  updateBill,
  deleteBill,
  getMyBills,
};

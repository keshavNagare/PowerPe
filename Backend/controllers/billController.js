const Bill = require('../models/Bill');
const User = require('../models/User');
const Consumption = require('../models/Consumption');
const mongoose = require('mongoose');

// Helper: Month names

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

    // Create new Bill
    const newBill = new Bill({ user, name, units, amount, dueDate });
    const savedBill = await newBill.save();
    const populatedBill = await savedBill.populate('user', 'name email');

    // Update Consumption data
    const issueDate = new Date(savedBill.issueDate);
    const month = issueDate.getMonth() + 1; // 1-12
    const year = issueDate.getFullYear();

    const existingConsumption = await Consumption.findOne({ user, month, year });

    if (existingConsumption) {
      existingConsumption.units += units;
      await existingConsumption.save();
    } else {
      await Consumption.create({ user, month, year, units });
    }

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
    if (!mongoose.Types.ObjectId.isValid(billId)) return res.status(400).json({ message: 'Invalid Bill ID' });

    let bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Save old units & date
    const oldUnits = bill.units;
    const oldDate = new Date(bill.issueDate);
    const oldMonth = oldDate.getMonth() + 1;
    const oldYear = oldDate.getFullYear();

    // Update Bill fields
    bill.name = req.body.name ?? bill.name;
    bill.units = req.body.units ?? bill.units;
    bill.amount = req.body.amount ?? bill.amount;
    bill.dueDate = req.body.dueDate ?? bill.dueDate;
    bill.status = req.body.status ?? bill.status;

    await bill.save();

    // Update Consumption if units/date changed
    const newDate = new Date(bill.issueDate);
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();

    if (oldUnits !== bill.units || oldMonth !== newMonth || oldYear !== newYear) {
      // Decrease old consumption
      const oldConsumption = await Consumption.findOne({ user: bill.user, month: oldMonth, year: oldYear });
      if (oldConsumption) {
        oldConsumption.units -= oldUnits;
        if (oldConsumption.units <= 0) await oldConsumption.remove();
        else await oldConsumption.save();
      }

      // Increase new consumption
      const newConsumption = await Consumption.findOne({ user: bill.user, month: newMonth, year: newYear });
      if (newConsumption) {
        newConsumption.units += bill.units;
        await newConsumption.save();
      } else {
        await Consumption.create({ user: bill.user, month: newMonth, year: newYear, units: bill.units });
      }
    }

    // Update user if admin edited
    if (req.body.user && (req.body.user.name || req.body.user.email)) {
      let user = await User.findById(bill.user);
      if (user) {
        if (req.body.user.name) user.name = req.body.user.name;
        if (req.body.user.email) user.email = req.body.user.email;
        await user.save();
      }
    }

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
    if (!mongoose.Types.ObjectId.isValid(billId)) return res.status(400).json({ message: 'Invalid Bill ID' });

    const bill = await Bill.findByIdAndDelete(billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Adjust consumption
    const billDate = new Date(bill.issueDate);
    const month = billDate.getMonth() + 1;
    const year = billDate.getFullYear();

    const consumption = await Consumption.findOne({ user: bill.user, month, year });
    if (consumption) {
      consumption.units -= bill.units;
      if (consumption.units <= 0) await consumption.remove();
      else await consumption.save();
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

module.exports = { getAllBills, createBill, updateBill, deleteBill, getMyBills };

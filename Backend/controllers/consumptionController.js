const Consumption = require('../models/Consumption');

exports.getMyConsumption = async (req, res) => {
  try {
    const data = await Consumption.find({ user: req.user._id }).sort({ month: 1 });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

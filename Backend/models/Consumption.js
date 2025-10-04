const mongoose = require('mongoose');

const consumptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // e.g., 'Jan', 'Feb'
  units: { type: Number, required: true },
});

module.exports = mongoose.model('Consumption', consumptionSchema);

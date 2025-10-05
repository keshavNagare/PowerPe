const mongoose = require('mongoose');

const consumptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1–12
  year: { type: Number, required: true },  // e.g., 2025
  units: { type: Number, required: true },
});

module.exports = mongoose.model('Consumption', consumptionSchema);

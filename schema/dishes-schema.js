const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  veg: {
    type: Boolean,
    required: true
  },
  ingredients: {
    type: Map,
    of: Number, // Quantities in kg/liters as decimal (e.g., 0.1 = 100g or 100ml)
    required: true
  }
}, {
  timestamps: true,
  collection: 'dishes'
});

module.exports = mongoose.model('Dish', dishSchema);

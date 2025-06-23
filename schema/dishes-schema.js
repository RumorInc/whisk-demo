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
  price: {
    type: Number,
    required: true
  },
  veg: {
    type: Boolean,
    required: true
  },
  available: {
    type: Boolean,
    required: true
  },
  ingredients: {
    type: Map,
    of: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'dishes'
});

module.exports = mongoose.model('Dish', dishSchema);

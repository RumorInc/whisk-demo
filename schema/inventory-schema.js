const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  item_id: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  },
  stock_level: {
    type: String,
    enum: ['alarm', 'warn', 'normal'],
    default: 'normal'
  },
  restock_disabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'inventory'
});

const Inventory = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = Inventory;
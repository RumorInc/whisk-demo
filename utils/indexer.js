const Chats = require('../schema/chats-schema');
const Inventory = require('../schema/inventory-schema');
const dishSchema = require('../schema/dishes-schema');
const fs = require('fs');
const path = require('path');

class Indexer {
  static async loadNav() {
    const tabs = await Chats.find({}, '_id title createdAt messages').lean();
    try {
      let obj = tabs.map(tab => ({
        id: tab._id,
        title: tab.title,
        createdAt: Indexer.formatDate(tab.createdAt),
        messages: tab.messages.length
      }));
      return obj;
    } catch (e) {
      throw e;
    }
  }
  static async loadInventory() {
    const items = await Inventory.find({}).lean();
    try {
      let obj = items.map(item => ({
        id: item.item_id,
        name: item.name,
        quantity: item.quantity.toFixed(1),
        emoji: item.emoji,
        stock_level: item.stock_level,
        restock_disabled: item.restock_disabled
      }));
      return obj;
    } catch (e) {
      throw e;
    }
  }
  static async loadDishes() {
    const items = await dishSchema.find({}).lean();
    try {
      let obj = items.map(item => ({
        id: item._id,
        name: item.name,
        icon: item.icon,
        price: item.price,
        veg: item.veg,
        available: item.available
      }));
      return obj;
    } catch (e) {
      throw e;
    }
  }
  static formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  static loadRoutes(app, routesPath, routePrefix = '') {
    fs.readdirSync(routesPath).forEach(file => {
      if (file.endsWith('.js')) {
        const route = require(path.join(routesPath, file));
        const routeName = file === 'route-index.js' ? '' : `/${file.replace('.js', '')}`;
        app.use(routePrefix + routeName, route);
        console.log(`✅ Loaded route: ${routePrefix + routeName}`);
      }
    });
  }
  static flattenInventory(inventory) {
    return inventory.map((item) => {
      let status = '';
      if (item.stock_level === 'alarm') {
        status = '(alarm, needs immediate restock, any dish requirning chicken will been delisted)';
      } else if (item.stock_level === 'warn') {
        status = '(warn, needs restock priority)';
      } else {
        status = '(normal, no restock required)';
      }
      return `[${item.name}: ${item.quantity}kg units ${status}]`;
    }).join('\n');
  }
}

module.exports = Indexer;

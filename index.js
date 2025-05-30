require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');
const readline = require('readline');
const { Server } = require('socket.io');
const Indexer = require('./utils/indexer');
const Inventory = require('./schema/inventory-schema');
const registerSocketHandlers = require('./sockets/handle');
const app = express();
const server = http.createServer(app);

const io = new Server(server);
registerSocketHandlers(io);

const port = 8080;

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

Indexer.loadRoutes(app, path.join(__dirname, 'routes'));
Indexer.loadRoutes(app, path.join(__dirname, 'routes/api'), '/api');

const recipe = {
  name: "Butter Chicken with Broccoli Stir",
  servings: 2,
  ingredients: {
    Chicken: 1.3,    // 300 grams
    Broccoli: 1.2,   // 200 grams
    Egg: 1.5,       // 50 grams (approx 1 egg)
    Onion: 1,      // 100 grams
    Butter: 0.5,    // 50 grams
    Tomato: 1.2     // 150 grams
  }
};
async function updateInventoryForButterChicken() {
  try {
    for (const [name, amount] of Object.entries(recipe.ingredients)) {
      // Find the corresponding inventory document
      const item = await Inventory.findOne({ name });
      if (!item) {
        console.warn(`Inventory item not found for ingredient: ${name}`);
        continue;
      }

      // Deduct the required amount from the stock
      item.quantity -= amount;

      // Ensure quantity doesn't go negative
      if (item.quantity < 0) {
        console.warn(`Stock for ${name} went negative. Setting to zero.`);
        item.quantity = 0;
        item.stock_level = 'alarm';
        item.restock_disabled = false;
      }

      // Save the updated document back to MongoDB
      await item.save();
    }
  } catch (err) {
    console.error("Error updating inventory:", err);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

setTimeout(() => {
  rl.question(`Do you want to accept order of ${recipe.name}? (yes/no) `, answer => {
    if (answer.trim().toLowerCase() === 'yes') {
      updateInventoryForButterChicken()
        .then(() => {
          console.log('Order accepted and inventory updated.');
        })
        .catch(err => {
          console.error('Failed to update inventory:', err);
          process.exit(1);
        });
    } else {
      console.log('Order cancelled. No changes made.');
      process.exit(0);
    }
    rl.close();
  });
}, 5000)

mongoose.connect(process.env.uri)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
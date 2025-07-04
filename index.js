require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Indexer = require('./utils/indexer');
const registerSocketHandlers = require('./sockets/handle');
const app = express();
app.use(cors()); // open access for dev
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server);
registerSocketHandlers(io);

const port = 8080;

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

Indexer.loadRoutes(app, path.join(__dirname, 'routes'));
Indexer.loadRoutes(app, path.join(__dirname, 'routes/api'), '/api');

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
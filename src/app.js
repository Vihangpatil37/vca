const express = require('express');
const path = require('path');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Middleware
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', paymentRoutes);

module.exports = app;

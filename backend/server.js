const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();

// ========================================
// MIDDLEWARE
// ========================================

// CORS - allow cross-origin requests
app.use(cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========================================
// API ROUTES
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ========================================
// SERVE STATIC FILES (Frontend)
// ========================================

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Serve uploaded images (if any)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// All other routes -> serve the frontend SPA-style
app.get('*', (req, res) => {
  // For API routes that don't match, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API route not found',
    });
  }

  // For frontend pages, determine the correct HTML file
  let pagePath = 'index.html';

  // Map URL paths to HTML files
  const pageMap = {
    '/': 'index.html',
    '/products': 'products.html',
    '/product': 'product.html',
    '/cart': 'cart.html',
    '/checkout': 'checkout.html',
    '/login': 'login.html',
    '/register': 'register.html',
    '/profile': 'profile.html',
    '/admin': 'admin.html',
    '/order-success': 'order-success.html',
    '/wishlist': 'wishlist.html',
  };

  // Exact match
  if (pageMap[req.path]) {
    pagePath = pageMap[req.path];
  } else {
    // Check if it's a product details page with query params
    if (req.path.startsWith('/product/') || req.path.startsWith('/product?')) {
      pagePath = 'product.html';
    } else {
      pagePath = 'index.html'; // Default to index
    }
  }

  res.sendFile(path.join(__dirname, '..', 'client', pagePath));
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`  🛒 E-Commerce Store Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`=================================\n`);
});

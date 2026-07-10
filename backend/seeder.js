/**
 * ========================================
 * DATABASE SEEDER
 * Populates the database with sample products
 * Run: node backend/seeder.js
 * ========================================
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Product = require('./models/Product');

// Sample Products
const products = [
  {
    title: 'Wireless Bluetooth Headphones Pro',
    description:
      'Premium wireless headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions. Features Bluetooth 5.0, built-in microphone, and foldable design for easy portability.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    price: 2499,
    stock: 45,
    rating: 4.5,
    numReviews: 128,
    featured: true,
  },
  {
    title: 'Smart Fitness Watch',
    description:
      'Track your health and fitness with this advanced smartwatch. Features heart rate monitoring, step counter, sleep tracking, GPS, and 14-day battery life. Water resistant to 50m.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    price: 3999,
    stock: 30,
    rating: 4.3,
    numReviews: 95,
    featured: true,
  },
  {
    title: 'Classic Leather Jacket',
    description:
      'Timeless genuine leather jacket with a modern fit. Features YKK zippers, quilted lining, and multiple pockets. Perfect for casual and semi-formal occasions.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    price: 4999,
    stock: 20,
    rating: 4.7,
    numReviews: 67,
    featured: true,
  },
  {
    title: 'Premium Cotton T-Shirt Pack',
    description:
      'Pack of 3 premium 100% organic cotton t-shirts. Pre-shrunk, breathable fabric with reinforced stitching. Available in multiple colors. Comfortable everyday wear.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    price: 1299,
    stock: 100,
    rating: 4.2,
    numReviews: 234,
    featured: true,
  },
  {
    title: 'Stainless Steel Water Bottle',
    description:
      'Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof design with 750ml capacity. Eco-friendly alternative to plastic.',
    category: 'Home & Kitchen',
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    price: 899,
    stock: 80,
    rating: 4.6,
    numReviews: 189,
    featured: true,
  },
  {
    title: 'Professional Chef Knife Set',
    description:
      '7-piece professional kitchen knife set with high-carbon stainless steel blades. Includes chef knife, bread knife, utility knife, paring knife, kitchen shears, sharpening rod, and wooden block.',
    category: 'Home & Kitchen',
    image:
      'https://images.unsplash.com/photo-1594226801341-41427b4e5c19?w=400',
    price: 2999,
    stock: 35,
    rating: 4.8,
    numReviews: 156,
    featured: false,
  },
  {
    title: 'The Art of Programming',
    description:
      'Comprehensive guide to software development best practices. Covers algorithms, data structures, design patterns, and clean code principles. Perfect for beginners and experienced developers alike.',
    category: 'Books',
    image:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    price: 599,
    stock: 200,
    rating: 4.4,
    numReviews: 312,
    featured: true,
  },
  {
    title: 'Yoga Mat Premium Extra Thick',
    description:
      'Extra thick 6mm premium yoga mat with non-slip surface. Eco-friendly TPE material, lightweight and easy to carry. Includes carrying strap. Perfect for yoga, pilates, and exercise.',
    category: 'Sports',
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    price: 1499,
    stock: 60,
    rating: 4.5,
    numReviews: 89,
    featured: false,
  },
  {
    title: 'Natural Skin Care Set',
    description:
      'Complete skincare routine with natural ingredients. Includes face wash, toner, serum, moisturizer, and eye cream. Suitable for all skin types. Paraben-free and cruelty-free.',
    category: 'Beauty',
    image:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
    price: 1999,
    stock: 50,
    rating: 4.3,
    numReviews: 178,
    featured: false,
  },
  {
    title: 'Building Block Set 1000 Pcs',
    description:
      'Creative building block set with 1000 pieces in various colors and shapes. Compatible with all major brands. Includes storage box and idea booklet. Hours of creative fun for ages 6+.',
    category: 'Toys',
    image:
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
    price: 2499,
    stock: 40,
    rating: 4.6,
    numReviews: 245,
    featured: false,
  },
  {
    title: 'Wireless Charging Pad',
    description:
      'Fast wireless charging pad compatible with all Qi-enabled devices. 15W fast charge, slim design with LED indicator. Includes USB-C cable. Safety certified with overcharge protection.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    price: 1499,
    stock: 75,
    rating: 4.1,
    numReviews: 67,
    featured: false,
  },
  {
    title: 'Running Shoes Ultra Comfort',
    description:
      'Lightweight running shoes with responsive cushioning and breathable mesh upper. Features gel technology for impact absorption, arch support, and durable rubber outsole for traction.',
    category: 'Sports',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    price: 4499,
    stock: 25,
    rating: 4.4,
    numReviews: 143,
    featured: true,
  },
  {
    title: 'Bluetooth Portable Speaker',
    description:
      'Waterproof portable Bluetooth speaker with 360-degree sound. 20-hour battery life, built-in microphone, and USB-C charging. Perfect for outdoor adventures and pool parties.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    price: 1999,
    stock: 55,
    rating: 4.2,
    numReviews: 98,
    featured: false,
  },
  {
    title: 'Denim Jeans Classic Fit',
    description:
      'Classic fit denim jeans made from premium stretch denim. Features 5-pocket styling, button closure, and belt loops. Durable construction with comfortable everyday fit.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400',
    price: 1999,
    stock: 65,
    rating: 4.0,
    numReviews: 201,
    featured: false,
  },
  {
    title: 'Aromatherapy Essential Oil Diffuser',
    description:
      'Ultrasonic essential oil diffuser with 7-color LED lights. Covers up to 300 sq ft, runs up to 10 hours, and auto-shutoff feature. Includes 6 essential oil samples.',
    category: 'Home & Kitchen',
    image:
      'https://images.unsplash.com/photo-1602928298849-325cec8771c0?w=400',
    price: 1299,
    stock: 40,
    rating: 4.5,
    numReviews: 87,
    featured: false,
  },
  {
    title: 'Backpack Laptop 15.6 Inch',
    description:
      'Water-resistant laptop backpack with padded compartment for 15.6" laptops. Multiple pockets, USB charging port, and anti-theft design. Comfortable padded shoulder straps.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    price: 1799,
    stock: 48,
    rating: 4.3,
    numReviews: 112,
    featured: false,
  },
];

/**
 * Seed the database
 */
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected'.green);

    // Delete existing products
    await Product.deleteMany();
    console.log('Products cleared'.yellow);

    // Insert sample products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products inserted`.green);

    // Create default admin user if not exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com' });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        isAdmin: true,
      });
      console.log('Admin user created'.green);
      console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@ecommerce.com'}`.cyan);
      console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`.cyan);
    } else {
      console.log('Admin user already exists'.yellow);
    }

    console.log('\n✅ Database seeded successfully!'.green.bold);
    console.log('   Run `npm start` to launch the app.\n');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Add colors for console output
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

Object.defineProperty(String.prototype, 'green', {
  get() {
    return colors.green(this);
  },
});
Object.defineProperty(String.prototype, 'red', {
  get() {
    return colors.red(this);
  },
});
Object.defineProperty(String.prototype, 'yellow', {
  get() {
    return colors.yellow(this);
  },
});
Object.defineProperty(String.prototype, 'cyan', {
  get() {
    return colors.cyan(this);
  },
});
Object.defineProperty(String.prototype, 'bold', {
  get() {
    return colors.bold(this);
  },
});
Object.defineProperty(String.prototype, 'underline', {
  get() {
    return `\x1b[4m${this}\x1b[0m`;
  },
});

seedDB();

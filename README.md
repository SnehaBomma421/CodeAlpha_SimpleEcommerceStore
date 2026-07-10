# 🛒 ShopVerse - Full Stack E-Commerce Store

A production-quality e-commerce website built with Node.js, Express, MongoDB, and vanilla JavaScript.

## ✨ Features

### User Features
- **Home Page** - Hero banner, featured products, categories, search
- **Product Listing** - Beautiful product cards with filters (search, category, price range, sort)
- **Product Details** - Full product info, quantity selector, add to cart/buy now
- **Shopping Cart** - Add/remove/update items, subtotal, tax, delivery, coupon codes
- **Checkout** - Shipping details, payment methods, order summary
- **User Authentication** - Register/Login with JWT & bcrypt
- **User Dashboard** - Profile, order history, account details
- **Wishlist** - Save favorite products
- **Recently Viewed** - Track browsing history
- **Dark/Light Mode** - Theme toggle
- **Search Suggestions** - Real-time product search
- **Responsive Design** - Mobile-first, works on all devices

### Admin Features
- Admin dashboard with product management
- Add/Edit/Delete products
- View and manage orders
- Update order status (Pending → Processing → Delivered → Cancelled)

### Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt password hashing
- **UI:** Modern glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017 or configure in .env)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-store
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Edit `.env` file if needed:
```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. **Seed the database** (optional - adds sample products)
```bash
node backend/seeder.js
```

5. **Start the server**
```bash
npm start
```

6. **Open in browser**
```
http://localhost:5000
```

### Default Admin Credentials
- **Email:** admin@ecommerce.com
- **Password:** admin123

## 📁 Project Structure

```
ecommerce-store/
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── server.js
│   └── seeder.js
├── client/
│   ├── index.html          # Home Page
│   ├── products.html       # Products Listing
│   ├── product.html        # Product Details
│   ├── cart.html           # Shopping Cart
│   ├── checkout.html       # Checkout
│   ├── login.html          # Login
│   ├── register.html       # Registration
│   ├── profile.html        # User Dashboard
│   ├── admin.html          # Admin Panel
│   ├── order-success.html  # Order Confirmation
│   ├── wishlist.html       # Wishlist
│   ├── css/
│   │   └── style.css       # Complete Stylesheet
│   └── js/
│       ├── api.js          # API Service
│       ├── auth.js         # Authentication Module
│       ├── cart.js         # Cart Module
│       └── app.js          # Main Application Logic
├── .env                    # Environment Variables
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | Private |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| GET | `/api/products/suggestions` | Search suggestions | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create order | Private |
| GET | `/api/orders` | Get user orders | Private |
| GET | `/api/orders/all` | Get all orders | Admin |
| GET | `/api/orders/:id` | Get order by ID | Private |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

## 🎨 Design Features
- Modern glassmorphism UI with gradient accents
- Smooth animations and hover effects
- Responsive mobile-first design
- Dark/Light mode with persistence
- Loading skeletons and spinners
- Toast notifications
- Professional typography and spacing

## 💡 Coupon Codes (for testing)
- **SAVE10** - 10% discount
- **WELCOME20** - 20% discount
- **FREESHIP** - Free shipping

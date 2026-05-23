# 🛍️ ShopMart — Full-Stack MERN E-commerce Platform

> **Internship Capstone Project** — MERN Full Stack Development  
> Covers: React, Redux Toolkit, Node.js, Express.js, MongoDB, JWT Auth, TailwindCSS, REST APIs, DevOps basics

---

## 📁 Project Structure

```
mern-ecommerce/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   ├── generateToken.js  # JWT utility
│   │   └── seed.js           # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── mathController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # protect + admin guards
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── mathRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                 # React + Redux + TailwindCSS
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── PrivateRoute.jsx  # Route guards
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── product/
│   │   │       └── ProductCard.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   ├── AdminOrdersPage.jsx
│   │   │   │   ├── AdminProductFormPage.jsx
│   │   │   │   ├── AdminProductsPage.jsx
│   │   │   │   └── AdminUsersPage.jsx
│   │   │   ├── AuthPages.jsx       # Login + Register
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── MathPage.jsx        # Math Evaluator Project
│   │   │   ├── MyOrdersPage.jsx
│   │   │   ├── OrderDetailPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── cartSlice.js
│   │   │   │   ├── orderSlice.js
│   │   │   │   └── productSlice.js
│   │   │   └── store.js
│   │   ├── utils/
│   │   │   └── api.js              # Axios instance
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── .gitignore
├── package.json              # Root with concurrently
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** running locally OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### Step 1: Clone & Install

```bash
# Clone the project
git clone <your-repo-url>
cd mern-ecommerce

# Install all dependencies at once
npm run install-all
```

Or manually:
```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### Step 2: Configure Environment

```bash
# Copy env example
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_ecommerce
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
```

For **MongoDB Atlas**, replace MONGO_URI with your connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mern_ecommerce
```

---

### Step 3: Seed the Database

```bash
npm run seed
```

This creates:
- 3 users (1 admin + 2 regular users)
- 12 products across all categories

**Demo Credentials:**
| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@shopmart.com       | admin1234  |
| User  | john@example.com         | john123    |
| User  | priya@example.com        | priya123   |

---

### Step 4: Run the App

```bash
# Run both backend + frontend simultaneously
npm run dev
```

Or run separately:
```bash
# Terminal 1 — Backend
npm run server   # Starts on http://localhost:5000

# Terminal 2 — Frontend
npm run client   # Starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser 🎉

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description        |
|--------|----------------------|---------|-------------------|
| POST   | /api/auth/register   | Public  | Register user      |
| POST   | /api/auth/login      | Public  | Login user         |
| GET    | /api/auth/profile    | Private | Get my profile     |
| PUT    | /api/auth/profile    | Private | Update my profile  |

### Products
| Method | Endpoint                      | Access       | Description          |
|--------|-------------------------------|--------------|---------------------|
| GET    | /api/products                 | Public       | List all products    |
| GET    | /api/products/:id             | Public       | Get single product   |
| GET    | /api/products/featured        | Public       | Featured products    |
| GET    | /api/products/categories      | Public       | All categories       |
| POST   | /api/products                 | Admin        | Create product       |
| PUT    | /api/products/:id             | Admin        | Update product       |
| DELETE | /api/products/:id             | Admin        | Delete product       |
| POST   | /api/products/:id/reviews     | Private      | Submit review        |

### Orders
| Method | Endpoint                   | Access  | Description          |
|--------|----------------------------|---------|---------------------|
| POST   | /api/orders                | Private | Create order         |
| GET    | /api/orders/myorders       | Private | My orders            |
| GET    | /api/orders/:id            | Private | Get order detail     |
| PUT    | /api/orders/:id/pay        | Private | Mark as paid         |
| PUT    | /api/orders/:id/cancel     | Private | Cancel order         |
| GET    | /api/orders                | Admin   | All orders           |
| PUT    | /api/orders/:id/status     | Admin   | Update status        |
| GET    | /api/orders/stats          | Admin   | Sales stats          |

### Cart
| Method | Endpoint           | Access  | Description       |
|--------|--------------------|---------|------------------|
| GET    | /api/cart          | Private | Get cart          |
| POST   | /api/cart          | Private | Add to cart       |
| PUT    | /api/cart/:itemId  | Private | Update quantity   |
| DELETE | /api/cart/:itemId  | Private | Remove item       |
| DELETE | /api/cart          | Private | Clear cart        |

### Math Evaluator
| Method | Endpoint              | Access | Description          |
|--------|-----------------------|--------|---------------------|
| POST   | /api/math/evaluate    | Public | Evaluate expression  |
| GET    | /api/math/history     | Public | Get eval history     |

### Users (Admin)
| Method | Endpoint         | Access | Description       |
|--------|------------------|--------|------------------|
| GET    | /api/users       | Admin  | All users         |
| GET    | /api/users/stats | Admin  | Dashboard stats   |
| PUT    | /api/users/:id   | Admin  | Update user       |
| DELETE | /api/users/:id   | Admin  | Delete user       |

---

## ✨ Features

### User Features
- 🔐 Register & Login with JWT authentication
- 🛍️ Browse products with search, filter, sort, and pagination
- 📦 View product details with image gallery and reviews
- 🛒 Add to cart, update quantities, remove items
- 💳 Multi-step checkout (Shipping → Payment → Review)
- 📋 View order history and track order status
- ⭐ Submit product reviews
- 👤 Edit profile, address, and password

### Admin Features
- 📊 Dashboard with stats (users, orders, revenue)
- 📦 Full product CRUD (create, read, update, delete)
- 🛍️ Order management with status updates + tracking numbers
- 👥 User management (role toggle, activate/deactivate, delete)

### Special Features
- 🧮 **Math Expression Evaluator** — evaluates complex expressions without `eval()`
  - Supports: `+`, `-`, `*`, `/`, `^`, `sqrt()`, `sin()`, `cos()`, `tan()`, `log()`, `ln()`, `abs()`, `factorial()`, `pi`, `e`
  - Shows step-by-step evaluation
  - Keeps history of recent calculations

---

## 🛠️ Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | React 18, React Router v6, Redux Toolkit, TailwindCSS |
| State Mgmt | Redux Toolkit (slices, createAsyncThunk)              |
| Backend    | Node.js, Express.js                                  |
| Database   | MongoDB, Mongoose ODM                                |
| Auth       | JWT (JSON Web Tokens), bcryptjs                      |
| HTTP       | Axios (with interceptors)                            |
| Styling    | TailwindCSS, custom CSS components                   |
| Dev Tools  | nodemon, concurrently, morgan                        |

---

## 📚 Concepts Covered (Internship Curriculum)

| Topic                               | Implementation                              |
|-------------------------------------|---------------------------------------------|
| React Fundamentals                  | All pages built as functional components    |
| React Hooks                         | useState, useEffect, useCallback, useRef    |
| Redux Toolkit                       | 4 slices: auth, cart, products, orders      |
| Context API alternative             | Global state via Redux store                |
| React Router v6                     | Nested routes, protected routes, params     |
| TailwindCSS                         | Responsive design, custom components        |
| Node.js & Express                   | RESTful API server                          |
| MongoDB & Mongoose                  | Models: User, Product, Order, Cart          |
| JWT Authentication                  | Protected routes, middleware                |
| REST API                            | 30+ endpoints with CRUD operations          |
| Full-Stack Integration              | React → Axios → Express → MongoDB           |
| Math Expression Evaluator           | Recursive descent parser, no eval()         |
| Git Workflow                        | .gitignore, structured commits              |
| Environment Variables               | .env, dotenv                                |

---

## 🎓 Author

Built as the **MERN Full-Stack Development Internship Capstone Project**.

---

## 📄 License

MIT License — Free to use for learning and portfolio purposes.

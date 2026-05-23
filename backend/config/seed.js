const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

const users = [
  { name: 'Admin User',    email: 'admin@shopmart.com',   password: 'admin1234',  role: 'admin' },
  { name: 'John Doe',      email: 'john@example.com',     password: 'john123',   role: 'user' },
  { name: 'Priya Sharma',  email: 'priya@example.com',    password: 'priya123',  role: 'user' }
];

const products = [
  {
    name: 'Apple iPhone 15 Pro Max',
    description: 'The most powerful iPhone ever with A17 Pro chip, 48MP camera system, and titanium design. Features Action Button and USB-C connectivity.',
    price: 89999, originalPrice: 134900,
    category: 'Electronics', brand: 'Apple',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'],
    stock: 25, rating: 4.8, numReviews: 128, isFeatured: true,
    tags: ['smartphone', 'apple', 'ios', '5g']
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung Galaxy S24 Ultra with built-in S Pen, 200MP camera, and AI-powered features. Snapdragon 8 Gen 3 processor.',
    price: 74999, originalPrice: 129999,
    category: 'Electronics', brand: 'Samsung',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'],
    stock: 18, rating: 4.7, numReviews: 95, isFeatured: true,
    tags: ['smartphone', 'samsung', 'android', '5g']
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancelling wireless headphones. 30-hour battery life, quick charging, and exceptional audio quality.',
    price: 24990, originalPrice: 34990,
    category: 'Electronics', brand: 'Sony',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    stock: 42, rating: 4.9, numReviews: 214, isFeatured: true,
    tags: ['headphones', 'wireless', 'noise-cancelling']
  },
  {
    name: 'MacBook Pro 14-inch M3',
    description: 'Apple MacBook Pro with M3 chip. Up to 22 hours battery life, Liquid Retina XDR display, and exceptional performance.',
    price: 169900, originalPrice: 199900,
    category: 'Electronics', brand: 'Apple',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    stock: 12, rating: 4.9, numReviews: 67, isFeatured: true,
    tags: ['laptop', 'apple', 'macbook', 'm3']
  },
  {
    name: 'Nike Air Max 270',
    description: 'Nike Air Max 270 running shoes with Air unit in the heel for maximum cushioning. Breathable mesh upper for comfort.',
    price: 7995, originalPrice: 12995,
    category: 'Sports', brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    stock: 60, rating: 4.5, numReviews: 183, isFeatured: false,
    tags: ['shoes', 'running', 'nike', 'sports']
  },
  {
    name: 'The Complete JavaScript Course',
    description: 'Master modern JavaScript from the beginning! Includes ES6+, OOP, Async/Await, and more. Best-seller course.',
    price: 499, originalPrice: 3499,
    category: 'Books', brand: 'Udemy',
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'],
    stock: 999, rating: 4.7, numReviews: 450,
    tags: ['programming', 'javascript', 'web development']
  },
  {
    name: 'IKEA MALM Bed Frame',
    description: 'Clean and simple design MALM bed frame. Adjustable bed sides allow use of mattresses of different thicknesses.',
    price: 12999, originalPrice: 17999,
    category: 'Home & Garden', brand: 'IKEA',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
    stock: 8, rating: 4.3, numReviews: 56,
    tags: ['furniture', 'bedroom', 'bed']
  },
  {
    name: 'Maybelline Fit Me Foundation',
    description: 'Fit Me! Matte + Poreless Foundation matches skin tone and controls shine for a natural, poreless look.',
    price: 399, originalPrice: 599,
    category: 'Beauty', brand: 'Maybelline',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'],
    stock: 150, rating: 4.2, numReviews: 320,
    tags: ['makeup', 'foundation', 'beauty']
  },
  {
    name: 'Levi\'s 511 Slim Fit Jeans',
    description: 'Classic slim fit jeans that sit below the waist with a slim leg from hip to ankle. Versatile and stylish.',
    price: 2699, originalPrice: 3999,
    category: 'Clothing', brand: 'Levis',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
    stock: 80, rating: 4.4, numReviews: 98,
    tags: ['jeans', 'clothing', 'casual']
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: '7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.',
    price: 6499, originalPrice: 9999,
    category: 'Home & Garden', brand: 'Instant Pot',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=400'],
    stock: 35, rating: 4.6, numReviews: 142,
    tags: ['kitchen', 'cooking', 'appliance'], isFeatured: true
  },
  {
    name: 'LEGO Technic Bugatti Chiron',
    description: 'Build a sophisticated replica of the legendary Bugatti Chiron with this advanced LEGO Technic set. 3,599 pieces.',
    price: 12999, originalPrice: 16999,
    category: 'Toys', brand: 'LEGO',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    stock: 15, rating: 4.8, numReviews: 44,
    tags: ['lego', 'toys', 'model', 'bugatti']
  },
  {
    name: 'Fitbit Charge 6',
    description: 'Advanced health and fitness tracker with built-in GPS, heart rate monitoring, sleep tracking, and 7-day battery.',
    price: 11999, originalPrice: 17999,
    category: 'Electronics', brand: 'Fitbit',
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400'],
    stock: 55, rating: 4.4, numReviews: 89, isFeatured: true,
    tags: ['fitness', 'wearable', 'health', 'smartwatch']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern_ecommerce');
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany();
    await Product.deleteMany();

    const createdUsers = [];
    for (const user of users) {
      createdUsers.push(await User.create(user));
    }
    console.log(`✅ ${createdUsers.length} users seeded`);

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products seeded`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('Admin login: admin@shopmart.com / admin1234');
    console.log('User login:  john@example.com / john123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();

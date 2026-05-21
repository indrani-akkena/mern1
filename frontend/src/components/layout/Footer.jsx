import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-xl">ShopMart</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your one-stop destination for all your shopping needs. Quality products, great prices.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link to="/math" className="hover:text-white transition-colors">Math Calculator</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
            <li><span className="cursor-pointer hover:text-white transition-colors">Return Policy</span></li>
            <li><span className="cursor-pointer hover:text-white transition-colors">Support</span></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span>📧</span> support@shopmart.com</li>
            <li className="flex items-center gap-2"><span>📞</span> +91 98765 43210</li>
            <li className="flex items-center gap-2"><span>📍</span> Hyderabad, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500">© 2024 ShopMart. Built with MERN Stack as part of internship project.</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>React</span><span>·</span><span>Redux</span><span>·</span><span>Node.js</span><span>·</span><span>MongoDB</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

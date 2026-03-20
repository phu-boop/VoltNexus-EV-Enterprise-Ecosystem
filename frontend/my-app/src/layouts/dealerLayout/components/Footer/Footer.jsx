import React from 'react';
import { FiMessageSquare, FiHelpCircle, FiShield, FiHeart } from 'react-icons/fi';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-gray-200/80 py-6 px-8 mx-6 my-4 rounded-2xl animate-fadeIn">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">EV</span>
              </div>
              <p className="text-sm text-gray-600 font-medium flex items-center">
                © {currentYear} EV Dealer System. Made with 
                <FiHeart className="w-4 h-4 text-red-500 mx-1 animate-pulse" />
                All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-5">
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2.5 hover:bg-blue-50 rounded-xl group"
              >
                <FiMessageSquare className="w-4 h-4 group-hover:scale-110"/>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2.5 hover:bg-blue-50 rounded-xl group"
              >
                <FiHelpCircle className="w-4 h-4 group-hover:scale-110"/>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2.5 hover:bg-blue-50 rounded-xl group"
              >
                <FiShield className="w-4 h-4 group-hover:scale-110"/>
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-8">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
import React from 'react';
import { FiMessageSquare, FiHelpCircle, FiHeart } from 'react-icons/fi';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/60 py-5 px-6 mt-auto mx-6 my-3 rounded-3xl animate-fadeIn">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <p className="text-sm text-gray-600 font-medium flex items-center">
              © {currentYear} EV Dealer System. Made with 
              <FiHeart className="w-4 h-4 text-red-500 mx-1 animate-pulse" />
              All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2 hover:bg-blue-50 rounded-lg hover:scale-110"
              >
                <FiMessageSquare className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-all duration-300 p-2 hover:bg-blue-50 rounded-lg hover:scale-110"
              >
                <FiHelpCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((item, index) => (
              <a
                key={item}
                href="#"
                style={{ animationDelay: `${index * 100}ms` }}
                className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium hover:underline animate-fadeIn"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
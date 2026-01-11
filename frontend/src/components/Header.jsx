import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = ({ isAdmin, onAdminToggle }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">AIS</span>
            </div>
            <span className="text-gray-900 font-medium tracking-tight hidden sm:block">
              AI Automation Society
            </span>
          </div>

          {/* Center Tab */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                data-testid="classroom-tab"
                className="px-4 py-1.5 bg-white text-gray-900 rounded-md shadow-sm font-medium text-sm transition-all"
              >
                Classroom
              </button>
            </div>
          </div>

          {/* Admin Toggle */}
          <motion.button
            data-testid="admin-toggle-btn"
            onClick={onAdminToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2.5 rounded-lg transition-all ${
              isAdmin 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isAdmin ? (
              <Unlock className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Lock className="w-5 h-5" strokeWidth={1.5} />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const ACCESS_CODE = 'PV';

export const AdminModal = ({ isOpen, onClose, onSuccess, isLoggingOut }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (code === ACCESS_CODE) {
      onSuccess();
      setCode('');
      setError('');
    } else {
      setError('Incorrect access code');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLogout = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-md"
          data-testid="admin-modal"
        >
          {/* Close Button */}
          <button
            data-testid="close-admin-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-gray-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              {isLoggingOut ? 'Admin Access' : 'Enter Access Code'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLoggingOut 
                ? 'You are currently in Admin Mode' 
                : 'Enter the admin code to unlock editing features'
              }
            </p>
          </div>

          {isLoggingOut ? (
            <div className="space-y-3">
              <Button
                data-testid="logout-admin-btn"
                onClick={handleLogout}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Logout from Admin
              </Button>
              <Button
                data-testid="cancel-logout-btn"
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  data-testid="access-code-input"
                  type="password"
                  placeholder="Enter access code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                  }}
                  className={`text-center text-lg tracking-widest ${
                    error ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  autoFocus
                />
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 text-red-500 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              <Button
                data-testid="submit-access-code-btn"
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Unlock Admin Mode
              </Button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminModal;

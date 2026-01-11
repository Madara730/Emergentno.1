import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Copy, Check, Database } from 'lucide-react';
import { Button } from '../components/ui/button';

export const RLSErrorModal = ({ isOpen, onClose, sqlFix }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-auto"
          data-testid="rls-error-modal"
        >
          {/* Close Button */}
          <button
            data-testid="close-rls-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Database Configuration Required
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              The Supabase database is connected, but Row Level Security (RLS) policies need to be configured for the app to work properly.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
              <h3 className="font-medium text-gray-900">How to fix this:</h3>
            </div>
            <ol className="text-sm text-gray-600 space-y-2 ml-7 list-decimal">
              <li>Open your Supabase project dashboard</li>
              <li>Go to <strong>SQL Editor</strong> in the left sidebar</li>
              <li>Copy the SQL below and run it</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          {/* SQL Code Block */}
          <div className="relative">
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
                {sqlFix}
              </pre>
            </div>
            <Button
              data-testid="copy-sql-btn"
              onClick={handleCopy}
              className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy SQL
                </>
              )}
            </Button>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-center">
            <Button
              data-testid="dismiss-rls-modal-btn"
              onClick={onClose}
              className="bg-black text-white hover:bg-gray-800 px-8"
            >
              I understand
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RLSErrorModal;

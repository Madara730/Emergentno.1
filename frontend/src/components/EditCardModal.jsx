import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export const EditCardModal = ({ isOpen, onClose, onSubmit, onDelete, course, isLoading }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setImageUrl(course.image_url || '');
      setImagePreview(course.image_url || '');
    }
  }, [course]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      image_url: imageUrl,
    });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(course.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !course) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
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
          className="relative bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-lg"
          data-testid="edit-card-modal"
        >
          {/* Close Button */}
          <button
            data-testid="close-edit-modal-btn"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Edit Card
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Update the course title or cover image
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Course Title <span className="text-red-500">*</span>
              </label>
              <Input
                data-testid="edit-title-input"
                type="text"
                placeholder="e.g., Introduction to AI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <div className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md">
                      <Upload className="w-5 h-5 text-gray-700" />
                    </div>
                  </button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  data-testid="edit-upload-image-btn"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-0.5">or drag and drop</p>
                  </div>
                </motion.button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className={`flex items-center gap-2 ${
                  showDeleteConfirm 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                    : 'text-red-600 hover:bg-red-50 hover:border-red-200'
                }`}
                data-testid="delete-card-btn"
              >
                <Trash2 className="w-4 h-4" />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
              </Button>
              <Button
                data-testid="submit-edit-card-btn"
                type="submit"
                className="flex-1 bg-black text-white hover:bg-gray-800"
                disabled={!title.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditCardModal;

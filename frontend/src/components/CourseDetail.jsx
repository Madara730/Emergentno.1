import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  File, 
  Download, 
  Trash2,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';

const getFileIcon = (type) => {
  if (type?.startsWith('video/')) return Video;
  if (type?.startsWith('image/')) return ImageIcon;
  if (type?.includes('pdf') || type?.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const CourseDetail = ({ 
  course, 
  isAdmin, 
  onBack, 
  onSave, 
  isSaving 
}) => {
  const [contentDescription, setContentDescription] = useState(course?.content_description || '');
  const [files, setFiles] = useState(course?.files || []);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDescriptionChange = (e) => {
    setContentDescription(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({
      content_description: contentDescription,
      files: files
    });
    setHasChanges(false);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (isAdmin) setIsDragging(true);
  }, [isAdmin]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isAdmin) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [isAdmin]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles) => {
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          lastModified: file.lastModified
        };
        setFiles((prev) => [...prev, newFile]);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
      data-testid="course-detail-view"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <motion.button
              data-testid="back-btn"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            {/* Title */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gray-900 tracking-tight truncate max-w-[50%]">
              {course?.title}
            </h1>

            {/* Save Button (Admin Only) */}
            {isAdmin && (
              <motion.button
                data-testid="save-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  hasChanges
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" strokeWidth={1.5} />
                )}
                Save
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Hero Image */}
        <div className="aspect-video rounded-2xl overflow-hidden mb-8">
          <img
            src={course?.image_url || `https://picsum.photos/seed/${course?.id?.slice(0, 8) || 'default'}/1200/675`}
            alt={course?.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Course Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {course?.tag && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {course.tag}
              </span>
            )}
            <span className="text-gray-400 text-sm">
              {course?.progress || 0}% Complete
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
            {course?.title}
          </h1>
          {course?.description && (
            <p className="text-gray-600 leading-relaxed">
              {course.description}
            </p>
          )}
          <div className="mt-4">
            <Progress value={course?.progress || 0} className="h-2 bg-gray-100" />
          </div>
        </div>

        {/* Description Box */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            Course Content
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            {isAdmin ? (
              <Textarea
                data-testid="content-description-textarea"
                value={contentDescription}
                onChange={handleDescriptionChange}
                placeholder="Add course content, notes, or descriptions here..."
                className="min-h-[200px] bg-white border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            ) : (
              <div 
                data-testid="content-description-display"
                className="min-h-[100px] text-gray-700 leading-relaxed whitespace-pre-wrap"
              >
                {contentDescription || (
                  <span className="text-gray-400 italic">No content description available</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            Attachments
          </h2>

          {/* Admin: Upload Area */}
          {isAdmin && (
            <div
              data-testid="file-upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mb-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input
                type="file"
                id="file-input"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Upload className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* File List */}
          {files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group"
                    data-testid={`file-item-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FileIcon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-[400px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        data-testid={`download-file-${index}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      {isAdmin && (
                        <motion.button
                          data-testid={`remove-file-${index}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveFile(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-gray-500">No files attached</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;

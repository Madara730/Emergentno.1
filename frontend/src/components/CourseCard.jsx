import React from 'react';
import { Play, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '../components/ui/progress';

export const CourseCard = ({ course, isAdmin, onView, onEdit }) => {
  return (
    <motion.div
      data-testid={`course-card-${course.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <motion.img
          src={course.image_url || `https://picsum.photos/seed/${course.id?.slice(0, 8) || 'default'}/800/450`}
          alt={course.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Hover Overlay with Play Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
          onClick={() => onView(course)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
            className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Edit Button (Admin Only) */}
        {isAdmin && (
          <motion.button
            data-testid={`edit-card-btn-${course.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors z-10"
          >
            <Pencil className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
          </motion.button>
        )}

        {/* Tag Badge */}
        {course.tag && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
              {course.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 tracking-tight text-lg mb-2 line-clamp-1">
          {course.title}
        </h3>
        
        {course.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Progress</span>
            <span className="text-gray-900 font-semibold">{course.progress || 0}%</span>
          </div>
          <Progress 
            value={course.progress || 0} 
            className="h-1.5 bg-gray-100"
          />
        </div>

        {/* Continue Button */}
        <motion.button
          data-testid={`continue-btn-${course.id}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onView(course)}
          className="w-full mt-4 px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
        >
          Continue Learning
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CourseCard;

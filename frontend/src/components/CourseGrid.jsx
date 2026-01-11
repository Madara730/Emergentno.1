import React from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import CourseCard from './CourseCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const CourseGrid = ({ courses, isAdmin, onCreateCard, onViewCourse, onEditCourse, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-xl" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-2 bg-gray-200 rounded w-full mt-4" />
              <div className="h-10 bg-gray-200 rounded w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Your Courses</h2>
          <p className="text-gray-500 text-sm mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        {isAdmin && (
          <motion.button
            data-testid="create-card-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateCard}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Create Card
          </motion.button>
        )}
      </div>

      {/* Grid */}
      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No courses yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            {isAdmin ? 'Create your first course to get started' : 'No courses available at the moment'}
          </p>
          {isAdmin && (
            <motion.button
              data-testid="create-first-card-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateCard}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Create First Card
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdmin={isAdmin}
              onView={onViewCourse}
              onEdit={onEditCourse}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CourseGrid;

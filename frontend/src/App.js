import React, { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Header from "./components/Header";
import CourseGrid from "./components/CourseGrid";
import CourseDetail from "./components/CourseDetail";
import AdminModal from "./components/AdminModal";
import CreateCardModal from "./components/CreateCardModal";
import EditCardModal from "./components/EditCardModal";
import RLSErrorModal from "./components/RLSErrorModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default SQL fix for RLS errors
const DEFAULT_RLS_FIX = `
-- Run this SQL in Supabase SQL Editor to enable public access:

-- First, create the courses table if it doesn't exist:
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  content_description TEXT DEFAULT '',
  files JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  tag TEXT DEFAULT 'AIS+'
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read courses
CREATE POLICY "Public read access" ON public.courses
  FOR SELECT USING (true);

-- Allow anyone to insert courses (for demo purposes)
CREATE POLICY "Public insert access" ON public.courses
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update courses (for demo purposes)
CREATE POLICY "Public update access" ON public.courses
  FOR UPDATE USING (true);

-- Allow anyone to delete courses (for demo purposes)
CREATE POLICY "Public delete access" ON public.courses
  FOR DELETE USING (true);
`;

const Dashboard = () => {
  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Modal states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRLSError, setShowRLSError] = useState(false);
  const [rlsSqlFix, setRlsSqlFix] = useState(DEFAULT_RLS_FIX);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Course being edited
  const [editingCourse, setEditingCourse] = useState(null);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/courses`);
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      
      // Check for RLS error
      if (error.response?.status === 403 && error.response?.data?.detail?.code === "42501") {
        setRlsSqlFix(error.response.data.detail.sql_fix || DEFAULT_RLS_FIX);
        setShowRLSError(true);
      } else {
        toast.error("Failed to load courses");
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Admin toggle handler
  const handleAdminToggle = () => {
    setShowAdminModal(true);
  };

  const handleAdminSuccess = () => {
    setIsAdmin(!isAdmin);
    setShowAdminModal(false);
    toast.success(isAdmin ? "Logged out from Admin Mode" : "Admin Mode enabled");
  };

  // Create course
  const handleCreateCourse = async (courseData) => {
    setIsCreating(true);
    try {
      const response = await axios.post(`${API}/courses`, courseData);
      setCourses((prev) => [response.data, ...prev]);
      setShowCreateModal(false);
      toast.success("Course created successfully");
    } catch (error) {
      console.error("Error creating course:", error);
      
      if (error.response?.status === 403 && error.response?.data?.detail?.code === "42501") {
        setRlsSqlFix(error.response.data.detail.sql_fix || DEFAULT_RLS_FIX);
        setShowRLSError(true);
      } else {
        toast.error("Failed to create course");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Edit course (title/image)
  const handleEditCourse = async (courseData) => {
    if (!editingCourse) return;
    
    setIsEditing(true);
    try {
      const response = await axios.put(`${API}/courses/${editingCourse.id}`, courseData);
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? response.data : c))
      );
      setShowEditModal(false);
      setEditingCourse(null);
      toast.success("Course updated successfully");
    } catch (error) {
      console.error("Error updating course:", error);
      
      if (error.response?.status === 403 && error.response?.data?.detail?.code === "42501") {
        setRlsSqlFix(error.response.data.detail.sql_fix || DEFAULT_RLS_FIX);
        setShowRLSError(true);
      } else {
        toast.error("Failed to update course");
      }
    } finally {
      setIsEditing(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`${API}/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setShowEditModal(false);
      setEditingCourse(null);
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      
      if (error.response?.status === 403 && error.response?.data?.detail?.code === "42501") {
        setRlsSqlFix(error.response.data.detail.sql_fix || DEFAULT_RLS_FIX);
        setShowRLSError(true);
      } else {
        toast.error("Failed to delete course");
      }
    }
  };

  // Save course detail (content_description and files)
  const handleSaveCourseDetail = async (updateData) => {
    if (!selectedCourse) return;
    
    setIsSaving(true);
    try {
      const response = await axios.put(`${API}/courses/${selectedCourse.id}`, updateData);
      setCourses((prev) =>
        prev.map((c) => (c.id === selectedCourse.id ? response.data : c))
      );
      setSelectedCourse(response.data);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving course:", error);
      
      if (error.response?.status === 403 && error.response?.data?.detail?.code === "42501") {
        setRlsSqlFix(error.response.data.detail.sql_fix || DEFAULT_RLS_FIX);
        setShowRLSError(true);
      } else {
        toast.error("Failed to save changes");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // View handlers
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-white" data-testid="classroom-dashboard">
      <AnimatePresence mode="wait">
        {selectedCourse ? (
          <CourseDetail
            key="detail"
            course={selectedCourse}
            isAdmin={isAdmin}
            onBack={handleBackToDashboard}
            onSave={handleSaveCourseDetail}
            isSaving={isSaving}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Header 
              isAdmin={isAdmin} 
              onAdminToggle={handleAdminToggle} 
            />
            
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
              <CourseGrid
                courses={courses}
                isAdmin={isAdmin}
                onCreateCard={() => setShowCreateModal(true)}
                onViewCourse={handleViewCourse}
                onEditCourse={handleOpenEditModal}
                loading={loading}
              />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminSuccess}
        isLoggingOut={isAdmin}
      />

      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCourse}
        isLoading={isCreating}
      />

      <EditCardModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCourse(null);
        }}
        onSubmit={handleEditCourse}
        onDelete={handleDeleteCourse}
        course={editingCourse}
        isLoading={isEditing}
      />

      <RLSErrorModal
        isOpen={showRLSError}
        onClose={() => setShowRLSError(false)}
        sqlFix={rlsSqlFix}
      />

      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

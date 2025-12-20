import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { ROLES } from '../utils/constants';

import Landing from '../pages/Landing';
import CourseBrowse from '../pages/courses/CourseBrowse';
import CourseDetail from '../pages/courses/CourseDetail';
import Profile from '../pages/profile/Profile';
import CoursePlayer from '../pages/courses/CoursePlayer';
import CourseCreate from '../pages/courses/CourseCreate';
import CourseEdit from '../pages/courses/CourseEdit';
import MyCourses from '../pages/courses/MyCourses';
import StudentDashboard from '../pages/student/StudentDashboard';
import MyLearning from '../pages/student/MyLearning';
import Certificates from '../pages/student/Certificates';
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import CourseManagement from '../pages/instructor/CourseManagement';
import StudentProgress from '../pages/instructor/StudentProgress';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import CourseModeration from '../pages/admin/CourseModeration';
import CategoryManagement from '../pages/admin/CategoryManagement';
import InstructorVerification from '../pages/admin/InstructorVerification';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Player route often outside main layout or has special layout */}
            <Route path="/courses/:courseId/learn" element={
                <ProtectedRoute>
                    <CoursePlayer />
                </ProtectedRoute>
            } />

            <Route path="/" element={<MainLayout />}>
                <Route index element={<Landing />} />

                {/* Public/Shared Routes */}
                <Route path="courses" element={<CourseBrowse />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                {/* Student Routes */}
                <Route path="student" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.STUDENT]}>
                            <Navigate to="dashboard" replace />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="student/dashboard" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.STUDENT]}>
                            <StudentDashboard />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="my-learning" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.STUDENT]}>
                            <MyLearning />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="certificates" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.STUDENT]}>
                            <Certificates />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />

                {/* Instructor Routes */}
                <Route path="instructor/dashboard" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                            <InstructorDashboard />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="courses/create" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                            <CourseCreate />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="instructor/courses/:id/edit" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                            <CourseEdit />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="instructor/courses" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                            <CourseManagement />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="instructor/students" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                            <StudentProgress />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="admin/dashboard" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminDashboard />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                            <UserManagement />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="admin/courses" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                            <CourseModeration />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="admin/categories" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                            <CategoryManagement />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
                <Route path="admin/verification" element={
                    <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                            <InstructorVerification />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                } />
            </Route>

            <Route path="*" element={<div className="p-8 text-center text-gray-500">Page Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;

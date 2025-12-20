import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // or Loader
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on actual role
        if (user.role === ROLES.INSTRUCTOR) return <Navigate to="/instructor/dashboard" replace />;
        if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/student/dashboard" replace />;
    }

    return children;
};

export default RoleBasedRoute;

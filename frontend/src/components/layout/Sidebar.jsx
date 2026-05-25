import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Settings, Award, LayoutGrid, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    if (!user) return null;

    const links = {
        [ROLES.STUDENT]: [
            { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/my-learning', icon: BookOpen, label: 'My Learning' },
            { to: '/certificates', icon: Award, label: 'Certificates' },
            { to: '/profile', icon: User, label: 'Profile' },
            { to: '/settings', icon: Settings, label: 'Settings' },
        ],
        [ROLES.INSTRUCTOR]: [
            { to: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
            { to: '/instructor/students', icon: Users, label: 'Students' },
            { to: '/profile', icon: User, label: 'Profile' },
            { to: '/settings', icon: Settings, label: 'Settings' },
        ],
        [ROLES.ADMIN]: [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/users', icon: Users, label: 'Users' },
            { to: '/admin/categories', icon: LayoutGrid, label: 'Categories' },
            { to: '/profile', icon: User, label: 'Profile' },
            { to: '/settings', icon: Settings, label: 'Settings' },
        ]
    };

    const roleLinks = links[user.role] || [];

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <aside className="w-64 bg-surface border-r border-gray-800 min-h-screen hidden md:flex flex-col">
            <div className="p-6">
                <div className="flex items-center space-x-2 text-primary-500 font-bold text-2xl">
                    <LayoutDashboard className="h-8 w-8" />
                    <span>LMS</span>
                </div>
            </div>

            <nav className="p-4 space-y-2 flex-1">
                {roleLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                ? 'bg-primary-500/10 text-primary-500'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <link.icon className="mr-3 h-5 w-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800 space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-700">
                        {(user.cloudinary_avatar_url || user.avatar) ? (
                            <img
                                src={user.cloudinary_avatar_url || user.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{user.full_name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{user.role}</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={loggingOut}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all disabled:opacity-50"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    {loggingOut ? 'Signing out…' : 'Logout'}
                </button>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                                <LogOut size={28} />
                            </div>
                            <h3 className="text-xl font-black text-foreground">Log out?</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                You will need to sign in again to access your dashboard.
                            </p>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setConfirmOpen(false)}
                                    disabled={loggingOut}
                                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    {loggingOut ? 'Signing out…' : 'Yes, logout'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;

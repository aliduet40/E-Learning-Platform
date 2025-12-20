import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Settings, Award, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const Sidebar = () => {
    const { user } = useAuth();

    if (!user) return null;

    const links = {
        [ROLES.STUDENT]: [
            { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/my-learning', icon: BookOpen, label: 'My Learning' },
            { to: '/certificates', icon: Award, label: 'Certificates' },
        ],
        [ROLES.INSTRUCTOR]: [
            { to: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
            { to: '/instructor/students', icon: Users, label: 'Students' },
        ],
        [ROLES.ADMIN]: [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/users', icon: Users, label: 'Users' },
            { to: '/admin/categories', icon: LayoutGrid, label: 'Categories' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
        ]
    };

    const roleLinks = links[user.role] || [];

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

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white cursor-pointer transition-colors">
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

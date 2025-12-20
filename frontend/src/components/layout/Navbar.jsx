import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, BookOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <nav className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="bg-primary p-1.5 rounded-lg mr-2 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-foreground">EduPlatform</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/courses" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                            Browse
                        </Link>

                        {user?.role === 'instructor' && (
                            <Link to="/instructor/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                Instructor
                            </Link>
                        )}
                        {user?.role === 'student' && (
                            <Link to="/student/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                Dashboard
                            </Link>
                        )}
                        {user?.role === 'admin' && (
                            <Link to="/admin/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                Admin
                            </Link>
                        )}

                        <div className="h-6 w-px bg-border mx-2"></div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all hover:scale-105"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-foreground">
                                        {user.full_name || 'User'}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-medium"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <button className="px-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                                        Log in
                                    </button>
                                </Link>
                                <Link to="/signup">
                                    <button className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                                        Sign up
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, BookOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const avatarSrc = user?.cloudinary_avatar_url || user?.avatar;

    return (
        <nav className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                            <div className="bg-primary p-1.5 rounded-lg mr-2 group-hover:scale-110 transition-transform">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-black text-xl tracking-tight text-foreground">EduPlatform</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
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
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all hover:scale-105"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <div className="h-6 w-px bg-border"></div>
                                <Link to="/profile" className="flex items-center space-x-3 group">
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt={user.full_name || 'User'}
                                            className="h-9 w-9 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-muted border-2 border-border group-hover:border-primary flex items-center justify-center text-muted-foreground transition-colors">
                                            <User className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-sm font-bold text-foreground capitalize group-hover:text-primary transition-colors">
                                            {user.full_name || 'User'}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {user.role}
                                        </span>
                                    </div>
                                </Link>
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

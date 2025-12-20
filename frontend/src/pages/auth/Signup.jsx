import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../components/auth/AuthCard';
import RoleSelector from '../../components/auth/RoleSelector';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { ROLES } from '../../utils/constants';

const Signup = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: ROLES.STUDENT // Default
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Backend expects 'full_name' (already in state) and lowercase 'role'
            const payload = {
                ...formData,
                role: formData.role.toLowerCase()
            };
            await signup(payload);
            navigate('/login'); // Redirect to login after successful signup
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create account.');
            if (err.response?.data?.errors) {
                console.error("Validation errors:", err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Create your account"
            subtitle={<>Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link></>}
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-3">Select Account Type</label>
                    <RoleSelector selectedRole={formData.role} onSelect={handleRoleSelect} />
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                        Full Name
                    </label>
                    <div className="relative rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-input bg-background text-foreground rounded-xl py-2.5 placeholder:text-muted-foreground/30 transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                        Email address
                    </label>
                    <div className="relative rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-input bg-background text-foreground rounded-xl py-2.5 placeholder:text-muted-foreground/30 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-input bg-background text-foreground rounded-xl py-2.5 placeholder:text-muted-foreground/30 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader size={20} className="text-primary-foreground" /> : 'Create Account'}
                    </button>
                </div>
            </form>
        </AuthCard>
    );
};

export default Signup;

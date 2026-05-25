
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth.api'; // Assuming you will add it here or use axios directly
import AuthCard from '../../components/auth/AuthCard';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            await authApi.forgotPassword(email);
            setSuccess('Password reset link has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Reset Password"
            subtitle={<>Remember your password? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link></>}
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

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-input bg-background text-foreground rounded-xl py-2.5 placeholder:text-muted-foreground/30 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader size={20} className="text-primary-foreground" /> : 'Send Reset Link'}
                    </button>
                </div>
            </form>
        </AuthCard>
    );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Save, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import * as authApi from '../../api/auth.api';
import Loader from '../../components/common/Loader';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authApi.updateProfile(formData);
            const updatedUser = response.data.data;
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const mergedUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(mergedUser));
            window.location.reload();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-primary to-primary/60"></div>

                <div className="px-8 pb-8">
                    {/* Avatar Section */}
                    <div className="relative -mt-12 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
                        <div className="flex items-end">
                            <div className="p-1 bg-card rounded-full relative">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.full_name} className="h-24 w-24 rounded-full border-4 border-card object-cover" />
                                ) : (
                                    <div className="h-24 w-24 rounded-full border-4 border-card bg-muted flex items-center justify-center text-muted-foreground">
                                        <User className="h-10 w-10" />
                                    </div>
                                )}
                                {/* Verification Badge */}
                                {user?.role === 'instructor' && (
                                    <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-sm border border-border">
                                        {user?.isVerified ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                        ) : (
                                            <div className="group relative">
                                                <Clock className="w-5 h-5 text-orange-500 fill-orange-500/10 cursor-help" />
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    Verification Pending
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 mb-2">
                                <h2 className="text-2xl font-bold text-foreground capitalize">{user?.full_name}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${user?.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        user?.role === 'instructor' ? 'bg-primary/10 text-primary border-primary/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                        {user?.role}
                                    </span>
                                    <span className="text-muted-foreground text-sm flex items-center">
                                        <Mail size={12} className="mr-1" /> {user?.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="mt-8 border-t border-border pt-8">
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center border ${message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                                }`}>
                                {message.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                                {message.text}
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl animate-fade-in-up">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="block w-full pl-10 bg-background border border-input rounded-xl py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="block w-full bg-background border border-input rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Tell us about yourself..."
                                    ></textarea>
                                </div>

                                <div className="flex items-center space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {loading ? <Loader size={20} className="mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        disabled={loading}
                                        className="px-6 py-3 bg-background border border-input text-foreground rounded-xl font-medium hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-fade-in-up">
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">About</h3>
                                    <p className="text-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
                                        {user?.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-5 bg-card rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                            <Mail className="h-4 w-4 mr-2" />
                                            <span className="text-xs uppercase font-bold">Email Address</span>
                                        </div>
                                        <div className="text-foreground font-medium">{user?.email}</div>
                                    </div>
                                    <div className="p-5 bg-card rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                            <Shield className="h-4 w-4 mr-2" />
                                            <span className="text-xs uppercase font-bold">Account Role</span>
                                        </div>
                                        <div className="text-foreground font-medium capitalize flex items-center">
                                            {user?.role}
                                            {user?.role === 'instructor' && !user?.isVerified && (
                                                <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-full border border-orange-500/20">Processing Verification</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

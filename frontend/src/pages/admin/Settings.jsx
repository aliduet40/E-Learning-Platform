import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import * as authApi from '../../api/auth.api';
import Loader from '../../components/common/Loader';

const Settings = () => {
    const { user } = useAuth();
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
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-8">
                    <h2 className="text-xl font-bold text-foreground mb-6">Profile Settings</h2>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center border ${message.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                            {message.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;

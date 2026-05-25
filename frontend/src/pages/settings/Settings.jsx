import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save, AlertCircle, CheckCircle, Lock, KeyRound } from 'lucide-react';
import * as authApi from '../../api/auth.api';
import Loader from '../../components/common/Loader';

const persistUser = (updates) => {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...current, ...updates }));
};

const Banner = ({ message }) => {
    if (!message.text) return null;
    const isError = message.type === 'error';
    return (
        <div className={`mb-6 p-4 rounded-xl flex items-center border ${isError
            ? 'bg-destructive/10 text-destructive border-destructive/20'
            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
            {isError ? <AlertCircle className="h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
            <span className="text-sm font-semibold">{message.text}</span>
        </div>
    );
};

const Settings = () => {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('profile');

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-8">
                <aside className="space-y-1">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'password', label: 'Password', icon: KeyRound },
                    ].map((t) => {
                        const Icon = t.icon;
                        const active = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Icon size={16} className="mr-3" /> {t.label}
                            </button>
                        );
                    })}
                </aside>

                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    {tab === 'profile' && <ProfileTab user={user} />}
                    {tab === 'password' && <PasswordTab onForcedLogout={logout} />}
                </div>
            </div>
        </div>
    );
};

const ProfileTab = ({ user }) => {
    const [form, setForm] = useState({ full_name: user.full_name || '', bio: user.bio || '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name.trim()) {
            setMessage({ type: 'error', text: 'Full name cannot be empty.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await authApi.updateProfile({
                full_name: form.full_name.trim(),
                bio: form.bio || '',
            });
            persistUser(response.data.data);
            setMessage({ type: 'success', text: 'Profile updated.' });
            setTimeout(() => window.location.reload(), 700);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-2">Profile Information</h2>
            <p className="text-sm text-muted-foreground mb-6">This appears across the platform on your profile and in courses you create or enroll in.</p>
            <Banner message={message} />
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
                            value={form.full_name}
                            onChange={handleChange}
                            className="block w-full pl-10 bg-background border border-input rounded-xl py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email <span className="text-muted-foreground/60 text-xs">(cannot be changed)</span></label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="block w-full bg-muted/50 border border-input rounded-xl py-3 px-4 text-muted-foreground"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                    <textarea
                        name="bio"
                        rows="4"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        className="block w-full bg-background border border-input rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? <Loader size={18} className="mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Save Changes
                </button>
            </form>
        </div>
    );
};

const PasswordTab = ({ onForcedLogout }) => {
    const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.new_password.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (form.new_password !== form.confirm_password) {
            setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await authApi.changePassword({
                current_password: form.current_password,
                new_password: form.new_password,
            });
            setMessage({ type: 'success', text: 'Password changed. Logging you out in 2 seconds…' });
            setForm({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => onForcedLogout(), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-2">Change Password</h2>
            <p className="text-sm text-muted-foreground mb-6">For security, you'll be signed out and asked to log in again after changing your password.</p>
            <Banner message={message} />
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="password"
                            name="current_password"
                            value={form.current_password}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 bg-background border border-input rounded-xl py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="password"
                            name="new_password"
                            value={form.new_password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="block w-full pl-10 bg-background border border-input rounded-xl py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="password"
                            name="confirm_password"
                            value={form.confirm_password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="block w-full pl-10 bg-background border border-input rounded-xl py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? <Loader size={18} className="mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default Settings;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle, Clock, Calendar, Edit, Save, X, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import * as authApi from '../../api/auth.api';
import Loader from '../../components/common/Loader';

const formatJoined = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const persistUser = (updates) => {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    const merged = { ...current, ...updates };
    localStorage.setItem('user', JSON.stringify(merged));
};

const Profile = () => {
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [form, setForm] = useState({ full_name: user?.full_name || '', bio: user?.bio || '' });

    if (!user) return null;

    const avatarSrc = user.cloudinary_avatar_url || user.avatar;

    const startEdit = () => {
        setForm({ full_name: user.full_name || '', bio: user.bio || '' });
        setMessage({ type: '', text: '' });
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        setMessage({ type: '', text: '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.full_name.trim()) {
            setMessage({ type: 'error', text: 'Name cannot be empty.' });
            return;
        }
        setSaving(true);
        try {
            const payload = { full_name: form.full_name.trim(), bio: form.bio || '' };
            const response = await authApi.updateProfile(payload);
            const updated = response.data.data;
            persistUser(updated);
            setMessage({ type: 'success', text: 'Profile updated.' });
            // Reload so AuthContext re-reads from localStorage.
            setTimeout(() => window.location.reload(), 600);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update profile.',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <div className="flex items-center gap-3">
                    <Link
                        to="/settings"
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-all"
                    >
                        <SettingsIcon size={16} className="mr-2" /> Settings
                    </Link>
                    {!editing && (
                        <button
                            onClick={startEdit}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Edit size={16} className="mr-2" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center border ${message.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                    {message.text}
                </div>
            )}

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary to-primary/60"></div>

                <form onSubmit={handleSave} className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
                        <div className="flex items-end">
                            <div className="p-1 bg-card rounded-full relative">
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt={user.full_name}
                                        className="h-24 w-24 rounded-full border-4 border-card object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-full border-4 border-card bg-muted flex items-center justify-center text-muted-foreground">
                                        <User className="h-10 w-10" />
                                    </div>
                                )}
                                {user.role === 'instructor' && (
                                    <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 shadow-sm border border-border">
                                        {user.isVerified ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-orange-500 fill-orange-500/10" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 mb-2">
                                {editing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                        className="text-2xl font-bold text-foreground capitalize bg-background border border-input rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-foreground capitalize">{user.full_name}</h2>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        user.role === 'instructor' ? 'bg-primary/10 text-primary border-primary/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                    <span className="text-muted-foreground text-sm flex items-center">
                                        <Mail size={12} className="mr-1" /> {user.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {editing && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-all disabled:opacity-50"
                                >
                                    <X size={16} className="mr-2" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 border-t border-border pt-8 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">About</h3>
                            {editing ? (
                                <textarea
                                    name="bio"
                                    rows="4"
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    className="w-full bg-background border border-input rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            ) : (
                                <p className="text-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
                                    {user.bio || 'No bio added yet.'}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 bg-card rounded-xl border border-border shadow-sm">
                                <div className="flex items-center text-muted-foreground mb-2">
                                    <Mail className="h-4 w-4 mr-2" />
                                    <span className="text-xs uppercase font-bold">Email</span>
                                </div>
                                <div className="text-foreground font-medium break-all">{user.email}</div>
                            </div>
                            <div className="p-5 bg-card rounded-xl border border-border shadow-sm">
                                <div className="flex items-center text-muted-foreground mb-2">
                                    <Shield className="h-4 w-4 mr-2" />
                                    <span className="text-xs uppercase font-bold">Role</span>
                                </div>
                                <div className="text-foreground font-medium capitalize">{user.role}</div>
                            </div>
                            <div className="p-5 bg-card rounded-xl border border-border shadow-sm">
                                <div className="flex items-center text-muted-foreground mb-2">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span className="text-xs uppercase font-bold">Joined</span>
                                </div>
                                <div className="text-foreground font-medium">{formatJoined(user.created_at)}</div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, User, Mail, Shield, CheckCircle, XCircle,
    MoreVertical, Trash2, Edit3, ChevronDown, Check, X,
    Calendar, UserCheck, UserX, Loader2
} from 'lucide-react';
import * as usersApi from '../../api/users.api';
import { ROLES } from '../../utils/constants';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role: '',
        verified: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                role: filters.role,
                verified: filters.verified
            };
            const response = await usersApi.getUsers(params);
            if (response.data && response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const response = await usersApi.updateUser(selectedUser.id, {
                role: selectedUser.role,
                is_verified: selectedUser.is_verified
            });
            if (response.data.success) {
                setUsers(users.map(u => u.id === selectedUser.id ? response.data.data : u));
                setIsEditModalOpen(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            const response = await usersApi.deleteUser(id);
            if (response.data.success) {
                setUsers(users.filter(u => u.id !== id));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleStyles = (role) => {
        const styles = {
            student: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            instructor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            admin: 'bg-primary/10 text-primary border-primary/20'
        };
        return styles[role] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Shield className="text-primary" size={32} />
                        User Management
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage permissions, roles, and verification status across the platform.</p>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-sm flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full lg:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-background border-border border-2 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <select
                            className="w-full bg-background border-border border-2 rounded-2xl py-3 pl-11 pr-4 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm"
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        >
                            <option value="">All Roles</option>
                            <option value="student">Students</option>
                            <option value="instructor">Instructors</option>
                            <option value="admin">Admins</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                    </div>

                    <div className="relative flex-1 lg:w-48">
                        <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <select
                            className="w-full bg-background border-border border-2 rounded-2xl py-3 pl-11 pr-4 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm"
                            value={filters.verified}
                            onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="true">Verified Only</option>
                            <option value="false">Unverified Only</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Table section */}
            <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-8 py-6 text-left text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Name</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Roles</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Joining Date</th>
                                <th className="px-8 py-6 text-right text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="hover:bg-muted/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20 group-hover:scale-110 transition-transform">
                                                {user.full_name ? user.full_name.charAt(0) : <User />}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground text-lg leading-tight">{user.full_name}</p>
                                                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                                                    <Mail size={12} />
                                                    <span className="text-sm font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getRoleStyles(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {user.is_verified ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                                    <UserCheck size={14} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest">
                                                    <UserX size={14} /> Unverified
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                            <Calendar size={14} />
                                            {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser({ ...user });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-3 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-2xl transition-all border border-indigo-500/20 shadow-sm"
                                                title="Edit User"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 shadow-sm"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <UserX size={64} className="mb-4 opacity-20" />
                                            <p className="text-xl font-bold italic">No users found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border p-8 relative animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black">Edit User Status</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 border border-border">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                    {selectedUser.full_name ? selectedUser.full_name.charAt(0) : 'U'}
                                </div>
                                <div>
                                    <p className="font-black text-foreground">{selectedUser.full_name}</p>
                                    <p className="text-sm text-muted-foreground font-medium">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Platform Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.values(ROLES).map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setSelectedUser({ ...selectedUser, role })}
                                            className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedUser.role === role
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                                : 'bg-background hover:bg-muted border-border'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Account Verification</label>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser({ ...selectedUser, is_verified: !selectedUser.is_verified })}
                                    className={`w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${selectedUser.is_verified
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                                        : 'bg-orange-500/10 border-orange-500/40 text-orange-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl scale-110 ${selectedUser.is_verified ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                            {selectedUser.is_verified ? <Check size={18} /> : <XCircle size={18} />}
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-xs">
                                            {selectedUser.is_verified ? 'Verified Account' : 'Pending Verification'}
                                        </span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${selectedUser.is_verified ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedUser.is_verified ? 'left-7' : 'left-1'}`}></div>
                                    </div>
                                </button>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground rounded-[1.5rem] font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-4 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

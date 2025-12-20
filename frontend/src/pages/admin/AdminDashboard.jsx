import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, Shield, AlertCircle } from 'lucide-react';
import * as dashboardApi from '../../api/dashboard.api';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_students: 0,
        total_instructors: 0,
        total_courses: 0,
        total_enrollments: 0,
        total_revenue: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentCourses, setRecentCourses] = useState([]);
    const [revenueHistory, setRevenueHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardApi.getAdminDashboardStats();
                if (response.data && response.data.data) {
                    setStats(response.data.data.stats);
                    setRecentUsers(response.data.data.recent_users || []);
                    setRecentCourses(response.data.data.recent_courses || []);
                    setRevenueHistory(response.data.data.revenue_history || []);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;

    const getRoleBadge = (role) => {
        const styles = {
            student: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            instructor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            admin: 'bg-primary/10 text-primary border-primary/20'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[role] || ''}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Admin Overview</h1>
                        <p className="text-muted-foreground mt-1">Real-time platform insights and user activity.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-6 py-2.5 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all">
                            Export Report
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: stats.total_students, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Active learners' },
                    { label: 'Instructors', value: stats.total_instructors, icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10', sub: 'Course creators' },
                    { label: 'Courses', value: stats.total_courses, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Published catalog' },
                    { label: 'Platform Revenue', value: `$${stats.total_revenue.toLocaleString()}`, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', sub: 'Total earnings' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-card p-6 rounded-3xl shadow-sm border border-border group hover:border-primary/50 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{item.label}</p>
                                <p className="text-3xl font-black text-foreground mt-2">{item.value}</p>
                            </div>
                            <div className={`p-4 ${item.bg} ${item.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-bold text-muted-foreground">
                            <span className="text-emerald-500 mr-2">↑ 12%</span>
                            <span>{item.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Registrations */}
                <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black">Recent Registrations</h3>
                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.length > 0 ? (
                            recentUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                            {u.full_name ? u.full_name.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none">{u.full_name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        {getRoleBadge(u.role)}
                                        <p className="text-[10px] text-muted-foreground font-medium">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-muted-foreground italic">No recent registrations</div>
                        )}
                    </div>
                </div>

                {/* Recent Courses section replacing revenue breakdown */}
                <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black">Recent Courses</h3>
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">New</div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden shadow-xl shadow-primary/20">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <BookOpen size={80} />
                            </div>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Total Net Revenue</p>
                            <h4 className="text-4xl font-black mt-2">${stats.total_revenue.toLocaleString()}</h4>
                            <div className="mt-8 flex items-center space-x-2 text-xs font-bold">
                                <span className="px-2 py-1 bg-white/20 rounded-md">Real-time stats</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Latest Published Courses</p>
                            <div className="space-y-4">
                                {recentCourses.length > 0 ? (
                                    recentCourses.map((course, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm leading-none group-hover:text-primary transition-colors">{course.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">by {course.instructor_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-foreground">${parseFloat(course.price).toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
                                                    {new Date(course.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-muted-foreground italic">No recent courses activity</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

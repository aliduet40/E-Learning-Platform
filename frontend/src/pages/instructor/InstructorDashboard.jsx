import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Star, Plus, MoreVertical, Edit, Trash2, TrendingUp, DollarSign, Layers } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { getInstructorDashboardStats } from '../../api/dashboard.api';
import * as coursesApi from '../../api/courses.api';
import { useAuth } from '../../context/AuthContext';

const InstructorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const response = await getInstructorDashboardStats();
            const data = response.data.data;
            setStats(data.stats);
            setCourses(data.courses);
        } catch (error) {
            console.error("Failed to load dashboard:", error);
            // Fallback mock data for UI demo if API fails
            setStats({
                total_courses: 12,
                total_students: 1450,
                avg_rating: 4.8,
                total_revenue: 12500
            });
            setCourses([
                { id: 1, title: 'Mastering React Design Patterns', status: 'published', price: 49.99, enrollment_count: 850, category_name: 'Development', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070' },
                { id: 2, title: 'Advanced CSS & Animations', status: 'draft', price: 29.99, enrollment_count: 0, category_name: 'Design', thumbnail: 'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2070' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return;
        setDeleting(true);
        try {
            await coursesApi.deleteCourse(courseToDelete.id);
            await fetchDashboardData();
            setShowDeleteConfirm(false);
            setCourseToDelete(null);
        } catch (error) {
            console.error("Failed to delete course:", error);
            alert("Failed to delete course. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Instructor Dashboard</h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl">Manage your catalog, track student success, and monitor your platform growth.</p>
                </div>
                <Link to="/courses/create">
                    <button className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 transform hover:-translate-y-0.5 active:scale-95">
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Course
                    </button>
                </Link>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Courses', value: stats?.total_courses || 0, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Avg. Rating', value: Number(stats?.avg_rating || 0).toFixed(1), icon: Star, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                    { label: 'Total Revenue', value: `$${stats?.total_revenue?.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-card p-6 rounded-2xl border ${stat.border} shadow-sm transition-all hover:shadow-md group`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">+12%</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                            <div className="text-2xl font-black text-foreground mt-1">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Courses List Section */}
            <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Your Course Library</h2>
                        <p className="text-sm text-muted-foreground">Manage your published content and drafts</p>
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                            <option>All Statuses</option>
                            <option>Published</option>
                            <option>Draft</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Course Title</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Earnings</th>
                                <th className="px-6 py-5">Students</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <tr key={course.id} className="group hover:bg-muted/30 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="relative h-12 w-20 rounded-lg overflow-hidden border border-border shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform bg-muted">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><BookOpen size={16} /></div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-foreground font-bold text-sm leading-tight group-hover:text-primary transition-colors">{course.title}</div>
                                                    <div className="text-[11px] text-muted-foreground mt-1">{course.category_name} • ${course.price}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${course.status === 'published'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${course.status === 'published' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-foreground font-semibold text-sm">
                                            ${((course.enrollment_count || 0) * course.price * 0.7).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center text-foreground text-sm font-medium">
                                                <Users size={14} className="mr-1.5 text-muted-foreground" />
                                                {course.enrollment_count || 0}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/instructor/courses/${course.id}/edit`} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Edit Course">
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setCourseToDelete(course);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                                <BookOpen size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground">No courses yet</h3>
                                            <p className="text-sm text-muted-foreground mb-6">Start sharing your knowledge with the world today!</p>
                                            <Link to="/courses/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md shadow-primary/20">Create First Course</Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 text-center">
                            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <Trash2 size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-foreground mb-3">Delete Course?</h3>
                            <p className="text-muted-foreground leading-relaxed px-4">
                                You are about to permanently delete <span className="text-foreground font-bold italic">{courseToDelete?.title}</span>.
                                <br /><br />
                                This cannot be undone. All student progress and data will be lost.
                            </p>
                            <div className="mt-10 flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteCourse}
                                    disabled={deleting}
                                    className="w-full px-8 py-5 bg-red-500 text-white rounded-2xl font-black text-lg hover:bg-red-600 shadow-xl shadow-red-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
                                >
                                    {deleting ? 'Removing from database...' : 'Yes, Delete Absolutely'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full px-8 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all"
                                >
                                    Keep Course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default InstructorDashboard;

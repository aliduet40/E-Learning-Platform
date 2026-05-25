import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Award, PlayCircle, Star, Search, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as dashboardApi from '../../api/dashboard.api';
import Loader from '../../components/common/Loader';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_courses: 0,
        completed_courses: 0,
        avg_progress: 0
    });
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardApi.getStudentDashboardStats();
                const data = response.data.data;
                setStats({
                    total_courses: data.stats.total_courses,
                    completed_courses: data.stats.completed_courses,
                    avg_progress: data.stats.avg_progress
                });
                setEnrolledCourses(data.enrollments || []);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Welcome Section */}
            <header className="relative overflow-hidden bg-gray-900 rounded-3xl p-10 text-white shadow-2xl shadow-primary/10">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-4">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
                        <p className="text-gray-300 text-lg mb-8 max-w-md">You've averaged <span className="text-white font-bold">{Number(stats.avg_progress || 0).toFixed(0)}%</span> progress across your courses. Keep pushing!</p>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                                Resume Last Lesson
                            </button>
                            <Link to="/courses" className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl font-bold hover:bg-white/20 transition-all">
                                Browse New Courses
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Courses Enrolled', value: stats.total_courses, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Completed Courses', value: stats.completed_courses, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Avg. Progress', value: `${Number(stats.avg_progress || 0).toFixed(1)}%`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-foreground">{stat.value}</div>
                            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continue Learning Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-2xl font-black text-foreground">Continue Learning</h2>
                    <Link to="/my-learning" className="text-sm font-bold text-primary hover:underline flex items-center">
                        View my library <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {enrolledCourses.length > 0 ? (
                        enrolledCourses.map(course => (
                            <div key={course.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all group flex h-44">
                                <Link to={`/courses/${course.course_id}/learn`} className="w-1/3 relative overflow-hidden block bg-muted">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <PlayCircle size={40} className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300" />
                                    </div>
                                </Link>
                                <div className="w-2/3 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1">{course.title}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-4">Instructor: {course.instructor_name}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-muted-foreground">{course.progress}% Complete</span>
                                            <span className="text-primary">{new Date(course.enrolled_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="md:col-span-2 bg-muted/30 rounded-3xl border-2 border-dashed border-border py-16 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Nothing yet!</h3>
                            <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet. Ready to start?</p>
                            <Link to="/courses" className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25">
                                Explore Courses
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Recommended/Latest section (Optional but adds value) */}
            <section className="bg-muted/30 p-10 rounded-3xl border border-border flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-2xl font-black text-foreground mb-2">Unlock Certified Mastery</h2>
                    <p className="text-muted-foreground">Complete your active path and earn an industry-recognized certificate to boost your LinkedIn profile.</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-4 rounded-2xl bg-white border border-border shadow-sm flex items-center gap-3 font-bold text-foreground">
                        <Star className="text-yellow-500 fill-yellow-500" size={20} /> Advanced Mastery Path
                    </button>
                </div>
            </section>
        </div>
    );
};

export default StudentDashboard;

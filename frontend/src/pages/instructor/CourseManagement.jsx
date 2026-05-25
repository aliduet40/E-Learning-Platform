import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, Layers, Search } from 'lucide-react';
import * as coursesApi from '../../api/courses.api';
import * as dashboardApi from '../../api/dashboard.api';
import Loader from '../../components/common/Loader';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCourses = async () => {
        try {
            const response = await dashboardApi.getInstructorDashboardStats();
            if (response.data && response.data.data) {
                setCourses(response.data.data.courses || []);
            }
        } catch (error) {
            console.error("Failed to load courses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return;
        setDeleting(true);
        try {
            await coursesApi.deleteCourse(courseToDelete.id);
            await fetchCourses();
            setShowDeleteConfirm(false);
            setCourseToDelete(null);
        } catch (error) {
            console.error("Failed to delete course:", error);
            alert("Failed to delete course. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-24"><Loader /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">Control your course catalog, status, and content.</p>
                </div>
                <Link to="/courses/create">
                    <button className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 transform hover:-translate-y-0.5 active:scale-95">
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Course
                    </button>
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="flex-1 md:flex-none bg-muted/50 border-none rounded-xl px-4 py-3 outline-none font-bold text-sm">
                        <option>All Status</option>
                        <option>Published</option>
                        <option>Draft</option>
                        <option>Archived</option>
                    </select>
                </div>
            </div>

            {/* Courses List */}
            <div className="bg-card rounded-[2rem] border border-border shadow-md overflow-hidden animate-fade-in-up">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                            <tr>
                                <th className="px-8 py-6">Course Content</th>
                                <th className="px-6 py-6">Status</th>
                                <th className="px-6 py-6 text-center">Students</th>
                                <th className="px-6 py-6">Revenue Estim.</th>
                                <th className="px-8 py-6 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="group hover:bg-muted/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="relative h-14 w-24 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-500 bg-muted">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><BookOpen size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="ml-5">
                                                    <div className="text-foreground font-black text-sm group-hover:text-primary transition-colors">{course.title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider">{course.category_name || 'Uncategorized'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${course.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                course.status === 'draft' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${course.status === 'published' ? 'bg-emerald-500' :
                                                    course.status === 'draft' ? 'bg-orange-500' :
                                                        'bg-gray-500'
                                                    }`}></span>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-foreground">{course.enrollment_count || 0}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Students</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground">
                                                    ${((course.enrollment_count || 0) * course.price * 0.7).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">net income</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link to={`/instructor/courses/${course.id}/edit`} className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Edit Course">
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setCourseToDelete(course);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="p-3 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <div className="max-w-sm mx-auto">
                                            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground transition-transform hover:scale-110">
                                                <Layers size={48} />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground">No courses available</h3>
                                            <p className="text-sm text-muted-foreground mt-2 mb-8">It looks like you haven't created any courses that match your search yet.</p>
                                            <Link to="/courses/create" className="inline-flex px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all transform active:scale-95">
                                                Create First Course
                                            </Link>
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

export default CourseManagement;

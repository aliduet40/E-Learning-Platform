import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/course/CourseCard';
import { BookOpen } from 'lucide-react';
import * as courseApi from '../../api/courses.api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

const MyLearning = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getEnrolledCourses();
                // Access nested response.data.data and handle it as an array
                const data = response.data.data || [];
                setEnrolledCourses(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Failed to load your courses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;
    if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;

    if (enrolledCourses.length === 0) {
        return (
            <div className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-border shadow-sm">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                    <BookOpen size={40} />
                </div>
                <h3 className="text-2xl font-black text-foreground">No courses yet</h3>
                <p className="mt-2 text-muted-foreground max-w-sm mx-auto">You haven't enrolled in any courses yet. Explore our curated list to start your journey!</p>
                <div className="mt-8">
                    <a href="/courses" className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        Browse Courses
                    </a>
                </div>
            </div>
        );
    }

    const completedCount = enrolledCourses.filter(c => Number(c.progress) >= 100).length;
    const allCompleted = completedCount === enrolledCourses.length;
    const badgeCount = allCompleted ? completedCount : enrolledCourses.length;
    const badgeLabel = `${badgeCount} ${badgeCount === 1 ? 'Course' : 'Courses'} ${allCompleted ? 'Completed' : 'Enrolled'}`;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-foreground tracking-tight">My Learning</h1>
                <div className="text-sm font-bold text-muted-foreground bg-muted px-4 py-1.5 rounded-full border border-border">
                    {badgeLabel}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map(course => (
                    <div key={course.id} className="flex flex-col group hover:-translate-y-1 transition-all duration-300">
                        <CourseCard course={course} isFromMyLearning={true} />
                        <div className="bg-card p-5 rounded-b-2xl border-x border-b border-border shadow-sm -mt-2 pt-6">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="text-muted-foreground">{course.progress}% Complete</span>
                                <span className="text-primary">{course.completed_lessons || 0}/{course.total_lessons || 0} Lessons</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyLearning;

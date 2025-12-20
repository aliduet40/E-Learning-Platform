import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/course/CourseCard';
import CourseFilters from '../../components/course/CourseFilters';
import Pagination from '../../components/common/Pagination';
import * as courseApi from '../../api/courses.api';
import * as categoryApi from '../../api/categories.api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Sparkles, Grid, List } from 'lucide-react';

const CourseBrowse = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const catRes = await categoryApi.getCategories();
                if (catRes.data && catRes.data.success) {
                    setAllCategories(catRes.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getCourses({
                    page: currentPage,
                    search: searchTerm,
                    category: selectedCategories.join(',')
                });

                if (response.data && response.data.success) {
                    setCourses(response.data.data || []);
                    setTotalPages(response.data.pagination?.pages || 1);
                }
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, currentPage, selectedCategories]);

    const handleCategoryToggle = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
        setCurrentPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header */}
            <div className="bg-gray-900 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mt-20 -mr-20"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles size={14} className="mr-2" /> Start Learning Today
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 text-white">
                        Discover your next skill, <span className="text-primary italic">master your career.</span>
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Access over 1,000+ top-rated courses from industry leading experts around the globe.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Filters Sidebar */}
                <aside className="w-full lg:w-80 flex-shrink-0">
                    <CourseFilters
                        onSearch={setSearchTerm}
                        categories={allCategories}
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryToggle}
                    />
                </aside>

                {/* Course Grid Area */}
                <main className="flex-1 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 py-2 px-1">
                        <div>
                            <h2 className="text-2xl font-black text-foreground">Top Courses</h2>
                            <p className="text-sm text-muted-foreground mt-1">Found {courses.length} matches for your criteria</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center bg-muted p-1 rounded-xl border border-border">
                                <button className="p-2 bg-card rounded-lg shadow-sm text-primary"><Grid size={18} /></button>
                                <button className="p-2 text-muted-foreground hover:text-foreground"><List size={18} /></button>
                            </div>
                            <select className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                                <option>Popularity</option>
                                <option>Highest Rated</option>
                                <option>Newest First</option>
                                <option>Price: Low to High</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-card rounded-2xl border border-border h-80 animate-pulse"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-destructive/10 p-8 rounded-3xl border border-destructive/20 text-center">
                            <ErrorMessage message={error} />
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {courses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in-up">
                                    {courses.map(course => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                                    <h3 className="text-xl font-bold text-foreground">No matches found</h3>
                                    <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                                </div>
                            )}

                            <div className="pt-10 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseBrowse;

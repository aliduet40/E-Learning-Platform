import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, Clock, BookOpen, User, Star, CheckCircle, Share2, Heart, Globe, FileText, Video, HelpCircle } from 'lucide-react';
import ReviewList from '../../components/review/ReviewList';
import * as courseApi from '../../api/courses.api';
import * as reviewApi from '../../api/reviews.api';
import { enrollCourse, getEnrolledCourses } from '../../api/courses.api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [curriculum, setCurriculum] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch main course data first
                const courseRes = await courseApi.getCourseById(id);
                if (courseRes.data && courseRes.data.success) {
                    setCourse(courseRes.data.data);
                }

                // Fetch other data in parallel, but handle failures individually
                try {
                    const [curRes, reviewsRes] = await Promise.all([
                        courseApi.getCourseCurriculum(id).catch(err => {
                            console.error('Curriculum fetch failed:', err);
                            return { data: { success: false } };
                        }),
                        reviewApi.getCourseReviews(id).catch(err => {
                            console.error('Reviews fetch failed:', err);
                            return { data: { success: false } };
                        })
                    ]);

                    if (curRes.data && curRes.data.success) {
                        setCurriculum(curRes.data.data);
                    }
                    if (reviewsRes.data && reviewsRes.data.success) {
                        setReviews(reviewsRes.data.data);
                    }

                    // Check enrollment if user is logged in
                    if (user) {
                        try {
                            const enrolledRes = await getEnrolledCourses();
                            if (enrolledRes.data && enrolledRes.data.success) {
                                const enrolled = enrolledRes.data.data.some(c => c.id === parseInt(id));
                                setIsEnrolled(enrolled);
                            }
                        } catch (err) {
                            console.error('Failed to check enrollment:', err);
                        }
                    }
                } catch (secondaryErr) {
                    console.error('Secondary data fetch error:', secondaryErr);
                }

            } catch (err) {
                setError('Failed to load course details');
                console.error('Main fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, user]);

    const totalLessons = curriculum.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            const response = await enrollCourse(id);
            if (response.data && response.data.success) {
                alert('Successfully enrolled!');
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error('Enrollment error:', err);
            alert(err.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;
    if (!course) return <div className="p-8 text-center text-xl">Course not found</div>;

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <div className="bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 z-0"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center space-x-2 text-primary-300 font-medium text-sm tracking-wide uppercase">
                                <span>{course.category_name || 'General'}</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                                {course.title}
                            </h1>
                            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <span className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center font-bold">
                                    <span className="mr-1">{Number(course.average_rating).toFixed(1)}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < Math.floor(course.average_rating) ? "fill-current" : "text-white/20"} />
                                        ))}
                                    </div>
                                </span>
                                <span className="text-white/60">({course.review_count || 0} reviews)</span>
                                <span className="text-white/60 flex items-center"><User size={16} className="mr-1" /> Created by <span className="text-primary ml-1 underline cursor-pointer hover:text-white transition-colors">{course.instructor_name}</span></span>
                                <span className="text-white/60 flex items-center"><Globe size={16} className="mr-1" /> English</span>
                                <span className="text-white/60 flex items-center"><Clock size={16} className="mr-1" /> Last updated {new Date(course.updated_at).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center space-x-4 pt-4">
                                <button className="flex items-center text-white hover:text-red-400 transition-colors">
                                    <Heart className="mr-2" size={20} /> Wishlist
                                </button>
                                <button className="flex items-center text-white hover:text-blue-400 transition-colors">
                                    <Share2 className="mr-2" size={20} /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="border-b border-border mb-8 sticky top-0 bg-background z-20">
                            <nav className="flex space-x-8">
                                {['Overview', 'Curriculum', 'Instructor', 'Reviews'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${activeTab === tab.toLowerCase()
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Overview Content */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10 animate-fade-in-up">
                                <div className="prose max-w-none text-foreground">
                                    <h3 className="text-2xl font-bold text-foreground mb-4">About this course</h3>
                                    <p className="leading-relaxed text-muted-foreground">{course.description}</p>
                                    <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                </div>

                                {course.outcomes && (
                                    <div className="bg-muted rounded-xl p-8 border border-border">
                                        <h3 className="text-xl font-bold text-foreground mb-6">What you'll learn</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {course.outcomes.map((outcome, idx) => (
                                                <div key={idx} className="flex items-start">
                                                    <CheckCircle size={20} className="text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-muted-foreground text-sm font-medium">{outcome}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Curriculum Content */}
                        {activeTab === 'curriculum' && (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-foreground">Course Content</h3>
                                    <div className="text-sm text-muted-foreground">
                                        {curriculum.length} sections • {course.total_lessons || 0} lessons • {course.total_duration || 0} min total
                                    </div>
                                </div>
                                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                                    {curriculum.map((section, idx) => (
                                        <div key={section.id} className="bg-card">
                                            <div className="bg-muted px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors">
                                                <div className="flex items-center">
                                                    <span className="font-bold text-foreground">{section.title}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{section.lessons?.length || 0} lessons</span>
                                            </div>
                                            <div className="divide-y divide-border/50">
                                                {section.lessons?.map(lesson => (
                                                    <div key={lesson.id} className="px-6 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                        <div className="flex items-center text-muted-foreground">
                                                            {lesson.content_type === 'video' ? <Video size={16} className="text-primary mr-3" /> :
                                                                lesson.content_type === 'quiz' ? <HelpCircle size={16} className="text-purple-500 mr-3" /> :
                                                                    <FileText size={16} className="text-gray-500 mr-3" />}
                                                            <span className="text-sm">{lesson.title}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground/60">{lesson.duration ? `${lesson.duration}m` : '0:00'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews Content */}
                        {activeTab === 'reviews' && (
                            <div className="animate-fade-in-up">
                                <ReviewList reviews={reviews} />
                            </div>
                        )}

                        {/* Instructor Content */}
                        {activeTab === 'instructor' && (
                            <div className="animate-fade-in-up">
                                <div className="bg-muted rounded-xl p-8 border border-border">
                                    <div className="flex items-start gap-6">
                                        <div className="w-24 h-24 rounded-full bg-background overflow-hidden flex-shrink-0">
                                            {course.instructor_avatar ? (
                                                <img src={course.instructor_avatar} alt={course.instructor_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-3xl font-bold">
                                                    {course.instructor_name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-1">{course.instructor_name}</h3>
                                            <p className="text-primary font-bold mb-4">Instructor</p>
                                            <p className="text-muted-foreground leading-relaxed text-sm">
                                                {course.instructor_bio || "Experienced instructor with a passion for teaching complex topics in simple ways."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Floating Card */}
                    <div className="lg:relative">
                        <div className="sticky top-24">
                            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden lg:-mt-64 relative z-20">
                                {/* Preview Video Area */}
                                <div className="aspect-video bg-gray-900 relative group cursor-pointer">
                                    {course.thumbnail && (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <PlayCircle size={48} className="text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 text-center">
                                        <p className="text-white text-sm font-semibold drop-shadow-md">Preview this course</p>
                                    </div>
                                </div>

                                <div className="p-8">
                                    {(() => {
                                        const salePrice = Number(course.price) || 0;
                                        const originalPrice = Number(course.original_price) || 0;
                                        const hasDiscount = originalPrice > salePrice && salePrice > 0;
                                        const discountPct = hasDiscount
                                            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
                                            : 0;
                                        return (
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-4xl font-bold text-foreground">
                                                    {salePrice > 0 ? `$${salePrice.toFixed(2)}` : 'Free'}
                                                </span>
                                                {hasDiscount && (
                                                    <>
                                                        <span className="text-lg text-muted-foreground line-through mb-1.5">
                                                            ${originalPrice.toFixed(2)}
                                                        </span>
                                                        <span className="text-sm text-emerald-500 font-bold mb-2 ml-auto p-1 bg-emerald-500/10 rounded">
                                                            {discountPct}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {isEnrolled ? (
                                        <button
                                            onClick={() => navigate(`/courses/${id}/learn`)}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all mb-4 transform hover:-translate-y-0.5"
                                        >
                                            Go to Course
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all mb-4 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {enrolling ? 'Enrolling...' : 'Buy Now'}
                                        </button>
                                    )}

                                    <div className="space-y-4 text-sm text-muted-foreground">
                                        <p className="font-bold text-foreground mb-2">This course includes:</p>
                                        <div className="flex items-center"><Video size={18} className="mr-3 text-primary" /> {course.total_duration || 0} min on-demand video</div>
                                        <div className="flex items-center"><FileText size={18} className="mr-3 text-gray-500" /> {totalLessons} lessons</div>
                                        <div className="flex items-center"><HelpCircle size={18} className="mr-3 text-purple-500" /> Coding exercises</div>
                                        <div className="flex items-center"><Globe size={18} className="mr-3 text-blue-500" /> Full lifetime access</div>
                                        <div className="flex items-center"><CheckCircle size={18} className="mr-3 text-emerald-500" /> Certificate of completion</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;

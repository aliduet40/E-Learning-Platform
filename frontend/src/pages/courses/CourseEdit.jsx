import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CurriculumBuilder from '../../components/course/CurriculumBuilder';
import { Upload, ChevronRight, Check, Layout, BookOpen, Save, Globe, DollarSign, Tag, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';
import * as categoryApi from '../../api/categories.api';
import { getCourseById, updateCourse, getCourseCurriculum } from '../../api/courses.api';
import Loader from '../../components/common/Loader';

const CourseEdit = () => {
    const { id } = useParams();
    const [activeStep, setActiveStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [courseData, setCourseData] = useState({
        title: '',
        slug: '',
        description: '',
        category_id: '',
        level: 'beginner',
        price: '',
        original_price: '',
        status: 'draft',
        total_duration: '',
        thumbnail: ''
    });
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const catResponse = await categoryApi.getCategories();
                if (catResponse.data && catResponse.data.data) {
                    setCategories(catResponse.data.data);
                }

                // Fetch course details
                const courseResponse = await getCourseById(id);
                if (courseResponse.data && courseResponse.data.data) {
                    const data = courseResponse.data.data;
                    setCourseData({
                        title: data.title || '',
                        slug: data.slug || '',
                        description: data.description || '',
                        category_id: data.category_id || '',
                        level: data.level || 'beginner',
                        price: data.price || '',
                        original_price: data.original_price ?? '',
                        status: data.status || 'draft',
                        total_duration: data.total_duration || '',
                        thumbnail: data.thumbnail || ''
                    });
                }

                // Fetch curriculum
                const curriculumResponse = await getCourseCurriculum(id);
                if (curriculumResponse.data && curriculumResponse.data.data) {
                    setSections(curriculumResponse.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch course data', error);
                setMessage({ type: 'error', text: 'Failed to load course details.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-generate slug from title (only if not manually edited)
            if (name === 'title') {
                newData.slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            return newData;
        });
    };

    const handleSubmit = async (status = null) => {
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...courseData,
                status: status || courseData.status,
                sections
            };

            const response = await updateCourse(id, payload);

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Course updated successfully!' });
                setTimeout(() => {
                    navigate('/instructor/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to update course:", error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || "Failed to update course. Please check all fields."
            });
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: 'Course Details', icon: Layout },
        { id: 2, title: 'Curriculum', icon: BookOpen },
        { id: 3, title: 'Review & Update', icon: Check }
    ];

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Edit Course</h1>
                    <p className="text-lg text-muted-foreground">Update your course content and structure.</p>
                </div>

                {/* Steps Indicator */}
                <div className="mb-12">
                    <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = activeStep >= step.id;
                            const isCurrent = activeStep === step.id;

                            return (
                                <div key={step.id} className="flex flex-col items-center group cursor-pointer" onClick={() => setActiveStep(step.id)}>
                                    <div
                                        className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                                            ${isActive ? 'bg-primary text-white scale-100' : 'bg-card text-muted-foreground border border-border hover:border-primary/50'}
                                            ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                                        `}
                                    >
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className={`mt-3 text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
                    {/* Step 1: Course Information */}
                    {activeStep === 1 && (
                        <div className="p-8 lg:p-10 animate-fade-in-up">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-2">Course Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={courseData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg placeholder:text-muted-foreground/30 font-bold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                <div className="flex items-center gap-2"><LinkIcon size={16} /> Course Slug</div>
                                            </label>
                                            <input
                                                type="text"
                                                name="slug"
                                                value={courseData.slug}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-muted-foreground"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            rows="6"
                                            value={courseData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                <div className="flex items-center gap-2"><Tag size={16} /> Category</div>
                                            </label>
                                            <select
                                                name="category_id"
                                                value={courseData.category_id}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-2">
                                                <div className="flex items-center gap-2"><Clock size={16} /> Level</div>
                                            </label>
                                            <select
                                                name="level"
                                                value={courseData.level}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-muted rounded-xl p-6 border border-border">
                                        <label className="block text-sm font-semibold text-foreground mb-4">Course Thumbnail URL</label>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                name="thumbnail"
                                                value={courseData.thumbnail}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                placeholder="https://example.com/image.jpg"
                                            />

                                            {courseData.thumbnail && (
                                                <div className="relative w-full aspect-video rounded-lg border border-border overflow-hidden bg-background">
                                                    <img
                                                        src={courseData.thumbnail}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-muted rounded-xl p-6 border border-border">
                                        <label className="block text-sm font-semibold text-foreground mb-4">Price & Duration</label>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Sale Price ($)</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign size={16} className="text-muted-foreground" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={courseData.price}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Original Price ($) <span className="text-muted-foreground/60 normal-case">— optional, shown struck-through</span></label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign size={16} className="text-muted-foreground" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        name="original_price"
                                                        value={courseData.original_price}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        placeholder="Leave empty for no discount"
                                                    />
                                                </div>
                                                {courseData.original_price && courseData.price && Number(courseData.original_price) > Number(courseData.price) && (
                                                    <p className="text-xs text-emerald-600 font-bold mt-1">
                                                        {Math.round(((Number(courseData.original_price) - Number(courseData.price)) / Number(courseData.original_price)) * 100)}% OFF
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">Est. Duration (Min)</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Clock size={16} className="text-muted-foreground" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        name="total_duration"
                                                        value={courseData.total_duration}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Curriculum */}
                    {activeStep === 2 && (
                        <div className="p-8 lg:p-10 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Course Curriculum</h2>
                                <p className="text-muted-foreground">Manage sections and lessons.</p>
                            </div>
                            <CurriculumBuilder
                                sections={sections}
                                onChange={(newSections) => setSections(newSections)}
                            />
                        </div>
                    )}

                    {/* Step 3: Review & Update */}
                    {activeStep === 3 && (
                        <div className="p-12 text-center animate-fade-in-up">
                            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Save size={48} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-4">Save Your Changes</h2>
                            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                                Make sure everything is correct before updating your live course.
                            </p>

                            {message.text && (
                                <div className={`mb-8 p-4 rounded-xl flex items-center justify-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                    {message.type === 'error' && <AlertCircle size={20} />}
                                    {message.type === 'success' && <Check size={20} />}
                                    <span className="font-semibold">{message.text}</span>
                                </div>
                            )}

                            <div className="flex flex-wrap justify-center gap-4 px-4 pb-12">
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={submitting}
                                    className="px-8 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all flex items-center disabled:opacity-50 border border-border"
                                >
                                    <Save size={20} className="mr-2 text-muted-foreground" />
                                    {submitting ? 'Saving...' : 'Update Metadata'}
                                </button>

                                {courseData.status === 'draft' && (
                                    <>
                                        <button
                                            onClick={() => handleSubmit('published')}
                                            disabled={submitting}
                                            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 flex items-center"
                                        >
                                            <Globe size={20} className="mr-2" />
                                            {submitting ? 'Publishing...' : 'Publish Course Now'}
                                        </button>
                                        <button
                                            onClick={() => handleSubmit('archived')}
                                            disabled={submitting}
                                            className="px-8 py-4 bg-red-500/10 text-red-600 rounded-2xl font-bold hover:bg-red-500/20 transition-all border border-red-200 disabled:opacity-50 flex items-center"
                                        >
                                            <AlertCircle size={20} className="mr-2" />
                                            Archive Course
                                        </button>
                                    </>
                                )}

                                {courseData.status === 'published' && (
                                    <button
                                        onClick={() => handleSubmit('archived')}
                                        disabled={submitting}
                                        className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shadow-black/10 transition-all transform hover:-translate-y-1 disabled:opacity-50 flex items-center"
                                    >
                                        <AlertCircle size={20} className="mr-2" />
                                        Move to Archive
                                    </button>
                                )}

                                {courseData.status === 'archived' && (
                                    <button
                                        onClick={() => handleSubmit('draft')}
                                        disabled={submitting}
                                        className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 flex items-center"
                                    >
                                        <Save size={20} className="mr-2" />
                                        Restore to Draft
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="bg-muted/50 p-6 flex justify-between items-center border-t border-border">
                        <button
                            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                            disabled={activeStep === 1}
                            className="px-6 py-2.5 rounded-lg text-muted-foreground font-semibold hover:bg-background hover:shadow-sm border border-transparent hover:border-border disabled:opacity-50 transition-all"
                        >
                            Back
                        </button>

                        {activeStep < 3 && (
                            <button
                                onClick={() => setActiveStep(activeStep + 1)}
                                className="px-8 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-lg flex items-center transition-all"
                            >
                                Continue <ChevronRight size={18} className="ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseEdit;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, ChevronLeft, Menu, X, Star, HelpCircle, ChevronRight, AlertCircle } from 'lucide-react';
import * as courseApi from '../../api/courses.api';
import * as reviewApi from '../../api/reviews.api';
import * as lessonApi from '../../api/lessons.api';
import * as progressApi from '../../api/progress.api';
import * as quizApi from '../../api/quizzes.api';
import Loader from '../../components/common/Loader';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Progress State
    const [enrollmentId, setEnrollmentId] = useState(null);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [progress, setProgress] = useState(0);

    // Quiz State
    const [quiz, setQuiz] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { 12: 'A', 15: 'C' }
    const [quizResult, setQuizResult] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [quizAttempts, setQuizAttempts] = useState([]); // Store all attempts

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                const [courseRes, enrolledRes] = await Promise.all([
                    courseApi.getCourseById(courseId).catch(err => ({ error: err })),
                    courseApi.getEnrolledCourses().catch(err => ({ error: err }))
                ]);

                if (courseRes.error || !courseRes.data?.success) {
                    throw new Error("Failed to load course");
                }
                setCourse(courseRes.data.data);

                let eId = null;
                if (enrolledRes.data?.success) {
                    const enrolledCourse = enrolledRes.data.data.find(c => c.id === parseInt(courseId));
                    if (enrolledCourse) {
                        eId = enrolledCourse.enrollment_id;
                        setEnrollmentId(eId);
                        setProgress(enrolledCourse.progress || 0);
                    }
                }

                const promises = [
                    courseApi.getCourseCurriculum(courseId).catch(err => console.error(err)),
                ];

                if (eId) {
                    promises.push(progressApi.getEnrollmentProgress(eId).catch(err => console.error(err)));
                }

                const [currRes, progRes] = await Promise.all(promises);

                if (currRes && currRes.data?.success) {
                    setCurriculum(currRes.data.data);
                    if (currRes.data.data.length > 0 && currRes.data.data[0].lessons?.length > 0) {
                        fetchLessonDetails(currRes.data.data[0].lessons[0]);
                    }
                }

                if (progRes && progRes.data?.success) {
                    const completed = new Set(progRes.data.data.completed_lessons.map(l => l.lesson_id));
                    setCompletedLessons(completed);
                    // Also check if any quizzes are completed to show results? 
                    // For now simplicity.
                }

            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) init();
    }, [courseId]);

    // Helper to check existing attempts
    const checkExistingAttempt = async (quizId) => {
        try {
            // We can use the generic quiz results endpoint for this user & quiz
            const res = await quizApi.getQuizResults(quizId);
            if (res.data?.success && res.data.data.length > 0) {
                // Find the best or latest passed attempt
                const passedAttempt = res.data.data.find(a => a.passed) || res.data.data[0];
                if (passedAttempt) {
                    setQuizResult(passedAttempt);
                    // If it's passed, ensure we show the result screen
                    // Note: We don't set quizStarted=true or attemptId here necessarily, just showing result is enough.
                }
            }
        } catch (err) {
            console.error("Failed to check existing attempts:", err);
        }
    };

    const fetchLessonDetails = async (lessonStub) => {
        // Reset quiz state
        setQuiz(null);
        setQuizStarted(false);
        setQuizResult(null);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setAttemptId(null);

        setActiveLesson({ ...lessonStub, loading: true });

        try {
            const res = await lessonApi.getLessonById(lessonStub.id);
            if (res.data?.success) {
                const lessonData = res.data.data;
                setActiveLesson(lessonData);

                // If it's a quiz content type and has quiz data linked
                if (lessonData.content_type === 'quiz' && lessonData.quiz) {
                    await fetchQuizData(lessonData.quiz.id);
                    await checkExistingAttempt(lessonData.quiz.id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch lesson details:", error);
            setActiveLesson(prev => ({ ...prev, loading: false }));
        }
    };

    const fetchQuizData = async (quizId) => {
        try {
            const res = await quizApi.getQuizById(quizId);
            if (res.data?.success) {
                setQuiz(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch quiz:", error);
        }
    };

    const handleLessonSelect = (lesson) => {
        if (activeLesson?.id === lesson.id) return;
        fetchLessonDetails(lesson);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    const handleComplete = async () => {
        if (!activeLesson || !enrollmentId) return;

        try {
            setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
            const res = await lessonApi.completeLesson(activeLesson.id);
            if (res.data?.success) {
                setProgress(res.data.data.progress);
            }
        } catch (error) {
            console.error("Failed to complete lesson:", error);
            setCompletedLessons(prev => {
                const newSet = new Set(prev);
                newSet.delete(activeLesson.id);
                return newSet;
            });
        }
    };

    // Quiz Logic
    const handleStartQuiz = async () => {
        if (!quiz) return;
        try {
            setLoading(true);
            const res = await quizApi.startQuizAttempt(quiz.id);
            if (res.data?.success) {
                setAttemptId(res.data.data.id);
                setQuizStarted(true);
            }
        } catch (err) {
            alert("Failed to start quiz attempt.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (option) => {
        const currentQ = quiz.questions[currentQuestionIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: option
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!attemptId) return;
        try {
            setSubmittingQuiz(true);

            // Format answers for API
            const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
                question_id: parseInt(qId),
                answer: ans
            }));

            const res = await quizApi.submitQuiz(quiz.id, {
                attempt_id: attemptId,
                answers: formattedAnswers
            });

            if (res.data?.success) {
                setQuizResult(res.data.data); // Contains score, passed, etc.
                // If passed, mark lesson as complete
                if (res.data.data.passed) {
                    handleComplete();
                }
            }
        } catch (err) {
            console.error("Quiz submission failed:", err);
            alert("Failed to submit quiz.");
        } finally {
            setSubmittingQuiz(false);
        }
    };

    // Review Submission
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            await reviewApi.createReview(courseId, { rating, review: reviewText });
            alert('Review submitted successfully!');
            setShowReviewModal(false);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading && !course) return <div className="h-screen flex items-center justify-center bg-background"><Loader /></div>;
    if (!course) return <div className="h-screen flex items-center justify-center text-foreground">Course not found.</div>;

    const isLessonCompleted = (id) => completedLessons.has(id);

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-80 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* ... Sidebar Content ... */}
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <button onClick={() => navigate('/student/dashboard')} className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
                        </button>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 border-b border-border bg-card">
                        <h2 className="font-black text-lg leading-tight mb-4">{course.title}</h2>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {curriculum.map((section, idx) => (
                            <div key={section.id} className="border-b border-border/50">
                                <div className="px-6 py-4 bg-muted/10 font-bold text-sm text-foreground uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                                    Section {idx + 1}: {section.title}
                                </div>
                                <div>
                                    {section.lessons?.map((lesson) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect(lesson)}
                                            className={`w-full flex items-center px-6 py-4 text-left transition-all border-l-4 ${activeLesson?.id === lesson.id
                                                ? 'bg-primary/5 border-primary'
                                                : 'hover:bg-muted/50 border-transparent hover:border-border'
                                                }`}
                                        >
                                            <div className="mr-4 relative">
                                                {isLessonCompleted(lesson.id) ? (
                                                    <CheckCircle size={20} className="text-emerald-500 fill-emerald-500/10" />
                                                ) : (
                                                    <div className={`p-1 rounded-full ${activeLesson?.id === lesson.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {lesson.content_type === 'video' ? <PlayCircle size={18} /> :
                                                            lesson.content_type === 'quiz' ? <HelpCircle size={18} /> : <FileText size={18} />}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${activeLesson?.id === lesson.id ? 'text-primary font-bold' : 'text-foreground'}`}>
                                                    {lesson.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{lesson.duration || 0} min</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full lg:ml-0 min-w-0 bg-muted/10">
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center min-w-0">
                        <button onClick={() => setSidebarOpen(true)} className={`lg:hidden mr-4 p-2 rounded-lg hover:bg-muted ${sidebarOpen ? 'opacity-0 pointer-events-none' : ''}`}>
                            <Menu size={20} className="text-foreground" />
                        </button>
                        <h1 className="text-lg font-bold text-foreground truncate">
                            {activeLesson?.title || 'Course Content'}
                        </h1>
                    </div>
                    {/* Conditional Review Button */}
                    {progress === 100 && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="px-4 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-sm font-bold flex items-center transition-colors animate-fade-in"
                        >
                            <Star size={16} className="mr-2" />
                            Leave a Review
                        </button>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {activeLesson ? (
                            <>
                                <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                                    {activeLesson.loading ? (
                                        <div className="aspect-video flex items-center justify-center bg-muted animate-pulse">
                                            <Loader />
                                        </div>
                                    ) : activeLesson.content_type === 'quiz' ? (
                                        // QUIZ UI
                                        <div className="p-8 md:p-12 min-h-[400px]">
                                            {!quiz ? (
                                                <div className="text-center py-10">
                                                    <Loader /> <p>Loading Quiz...</p>
                                                </div>
                                            ) : !quizStarted && !quizResult ? (
                                                <div className="text-center">
                                                    <HelpCircle size={64} className="mx-auto mb-6 text-primary" />
                                                    <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
                                                    <p className="text-muted-foreground mb-8">
                                                        Passing Score: {quiz.passing_score}% • Time Limit: {quiz.time_limit ? `${quiz.time_limit} mins` : 'None'}
                                                    </p>
                                                    <button
                                                        onClick={handleStartQuiz}
                                                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all"
                                                    >
                                                        Start Quiz
                                                    </button>
                                                </div>
                                            ) : quizResult ? (
                                                <div className="text-center animate-fade-in-up">
                                                    {quizResult.passed ? (
                                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                            <CheckCircle size={40} className="text-emerald-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                            <AlertCircle size={40} className="text-red-600" />
                                                        </div>
                                                    )}
                                                    <h2 className="text-2xl font-bold mb-2">
                                                        {quizResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                                                    </h2>
                                                    <p className="text-lg mb-6">
                                                        You scored <span className="font-bold">{quizResult.percentage}%</span>
                                                    </p>

                                                    {!quizResult.passed && (
                                                        <button
                                                            onClick={() => {
                                                                setQuizResult(null);
                                                                setQuizStarted(false);
                                                                setAnswers({});
                                                                setCurrentQuestionIndex(0);
                                                            }}
                                                            className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80"
                                                        >
                                                            Retry Quiz
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                // Quiz Wizard
                                                <div className="max-w-2xl mx-auto">
                                                    <div className="mb-8 flex justify-between items-center text-sm font-bold text-muted-foreground">
                                                        <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                                                        {/* Optional Timer could go here */}
                                                    </div>

                                                    <div className="mb-8">
                                                        <h3 className="text-xl font-bold text-foreground mb-6">
                                                            {quiz.questions[currentQuestionIndex].question}
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, idx) => {
                                                                const letter = ['A', 'B', 'C', 'D'][idx];
                                                                const optionText = quiz.questions[currentQuestionIndex][optKey];
                                                                if (!optionText) return null;

                                                                const isSelected = answers[quiz.questions[currentQuestionIndex].id] === letter;

                                                                return (
                                                                    <button
                                                                        key={optKey}
                                                                        onClick={() => handleAnswerSelect(letter)}
                                                                        className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center ${isSelected
                                                                            ? 'border-primary bg-primary/5 text-primary'
                                                                            : 'border-border hover:border-primary/50'
                                                                            }`}
                                                                    >
                                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                                                            }`}>
                                                                            {letter}
                                                                        </span>
                                                                        {optionText}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-8 border-t border-border">
                                                        <button
                                                            onClick={handlePrevQuestion}
                                                            disabled={currentQuestionIndex === 0}
                                                            className="px-6 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted disabled:opacity-50"
                                                        >
                                                            Previous
                                                        </button>

                                                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                                                            <button
                                                                onClick={handleSubmitQuiz}
                                                                disabled={submittingQuiz || Object.keys(answers).length < quiz.questions.length} // Enforce all answered? Maybe not.
                                                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70"
                                                            >
                                                                {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={handleNextQuestion}
                                                                className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-all flex items-center"
                                                            >
                                                                Next <ChevronRight size={16} className="ml-2" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : activeLesson.content_type === 'video' ? (
                                        <div className="aspect-video bg-black flex items-center justify-center relative group">
                                            {/* Simulate Video Player */}
                                            {activeLesson.video_url ? (
                                                <iframe
                                                    src={activeLesson.video_url}
                                                    className="w-full h-full"
                                                    title={activeLesson.title}
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <div className="text-center p-8">
                                                    <PlayCircle size={64} className="text-white/50 mx-auto mb-4" />
                                                    <p className="text-white/70">Video Content Placeholder</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 md:p-12 min-h-[400px] prose dark:prose-invert max-w-none">
                                            {activeLesson.text_content ? (
                                                <div dangerouslySetInnerHTML={{ __html: activeLesson.text_content }} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                                    <FileText size={48} className="mb-4 opacity-50" />
                                                    <p>No content available for this lesson.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Only show manual complete button for non-quiz lessons */}
                                {activeLesson.content_type !== 'quiz' && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                                        <div className="text-sm text-muted-foreground font-medium">
                                            {isLessonCompleted(activeLesson.id) ? (
                                                <span className="flex items-center text-emerald-500 font-bold"><CheckCircle size={16} className="mr-2" /> Completed</span>
                                            ) : (
                                                <span>Not completed</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleComplete}
                                            disabled={isLessonCompleted(activeLesson.id)}
                                            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center ${isLessonCompleted(activeLesson.id)
                                                ? 'bg-muted text-muted-foreground cursor-default shadow-none'
                                                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25'
                                                }`}
                                        >
                                            {isLessonCompleted(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-lg">Select a lesson from the sidebar to start learning.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Write a Review</h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReview}>
                            <div className="flex justify-center mb-6 space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-muted-foreground mb-2">Your Feedback</label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className="w-full px-4 py-3 bg-muted rounded-xl border border-transparent focus:border-primary focus:bg-background transition-all outline-none resize-none h-32 text-foreground"
                                    placeholder="Tell us what you liked or didn't like..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-70"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursePlayer;

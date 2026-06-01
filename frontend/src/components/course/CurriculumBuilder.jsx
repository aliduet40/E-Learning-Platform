import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Trash2, GripVertical, FileText, HelpCircle, ClipboardList,
    ChevronDown, ChevronUp, Check, Search, AlertTriangle, Eye, BarChart2,
    Clock, Calendar, Hash, X, Layers, EyeOff, Users, Award, Edit2
} from 'lucide-react';

const WORDS_PER_MINUTE = 225;
const QUESTION_SECONDS = 60;
const DEFAULT_ASSIGNMENT_MINUTES = 30;

const TYPE_META = {
    text: { label: 'Article', icon: FileText, color: 'text-slate-500', tint: 'bg-slate-500/10' },
    quiz: { label: 'Quiz', icon: HelpCircle, color: 'text-purple-500', tint: 'bg-purple-500/10' },
    assignment: { label: 'Assignment', icon: ClipboardList, color: 'text-amber-600', tint: 'bg-amber-500/10' },
    video: { label: 'Video', icon: FileText, color: 'text-blue-500', tint: 'bg-blue-500/10' }
};

const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const readingMinutes = (wordCount) => Math.max(1, Math.ceil((wordCount || 0) / WORDS_PER_MINUTE));

const estimateLessonMinutes = (lesson) => {
    if (lesson.type === 'text') return readingMinutes(lesson.word_count || countWords(lesson.content));
    if (lesson.type === 'quiz') return Math.max(1, Math.ceil(((lesson.questions || []).length * QUESTION_SECONDS) / 60));
    if (lesson.type === 'assignment') return lesson.estimated_minutes || DEFAULT_ASSIGNMENT_MINUTES;
    return 0;
};

const sectionStats = (section) => {
    const lessons = section.lessons || [];
    const stats = { article: 0, quiz: 0, assignment: 0, minutes: 0 };
    lessons.forEach((l) => {
        if (l.type === 'text') stats.article += 1;
        else if (l.type === 'quiz') stats.quiz += 1;
        else if (l.type === 'assignment') stats.assignment += 1;
        stats.minutes += estimateLessonMinutes(l);
    });
    return stats;
};

const validateLesson = (lesson) => {
    const issues = [];
    if (lesson.type === 'text') {
        if (!lesson.content || !lesson.content.trim()) issues.push('Article body is empty');
    }
    if (lesson.type === 'quiz') {
        const questions = lesson.questions || [];
        if (questions.length === 0) issues.push('No questions added');
        questions.forEach((q, idx) => {
            if (!q.question || !q.question.trim()) issues.push(`Question ${idx + 1} is empty`);
            if (!q.correct_answer) issues.push(`Question ${idx + 1} has no correct answer`);
        });
    }
    if (lesson.type === 'assignment') {
        if (!lesson.instructions || !lesson.instructions.trim()) issues.push('Missing instructions');
        if (!lesson.total_marks) issues.push('Missing total marks');
        if (!lesson.due_date) issues.push('Missing due date');
    }
    if (!lesson.title || !lesson.title.trim()) issues.push('Untitled');
    return issues;
};

const formatDate = (iso) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return iso;
    }
};

const SUBMISSION_LABELS = {
    file: 'File upload',
    text: 'Text response',
    url: 'URL submission'
};

const CurriculumBuilder = ({ sections = [], onChange, courseId }) => {
    const [localSections, setLocalSections] = useState(sections);
    const [expandedSections, setExpandedSections] = useState(() => new Set(sections.map((s) => s.id)));
    const [editing, setEditing] = useState(null); // {sectionId, lessonId} for the open editor
    const [preview, setPreview] = useState(null); // {sectionId, lessonId}
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [studentView, setStudentView] = useState(false);
    const [showIssues, setShowIssues] = useState(false);

    const update = (next) => {
        setLocalSections(next);
        if (onChange) onChange(next);
    };

    const toggleSection = (id) => {
        const next = new Set(expandedSections);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedSections(next);
    };

    const addSection = () => {
        const newSection = { id: `s-${Date.now()}`, title: 'New Section', lessons: [] };
        update([...localSections, newSection]);
        setExpandedSections(new Set([...expandedSections, newSection.id]));
    };

    const deleteSection = (id) => {
        update(localSections.filter((s) => s.id !== id));
    };

    const renameSection = (id, title) => {
        update(localSections.map((s) => (s.id === id ? { ...s, title } : s)));
    };

    const addLesson = (sectionId, type) => {
        const base = {
            id: `l-${Date.now()}`,
            title: `New ${TYPE_META[type].label}`,
            type,
            published: false
        };
        const seed =
            type === 'quiz'
                ? { ...base, questions: [], passing_score: 70, attempts_allowed: 0 }
                : type === 'assignment'
                ? { ...base, instructions: '', total_marks: '', due_date: '', submission_type: 'file', status: 'open' }
                : { ...base, content: '', word_count: 0 };

        update(
            localSections.map((s) =>
                s.id === sectionId ? { ...s, lessons: [...(s.lessons || []), seed] } : s
            )
        );
        setEditing({ sectionId, lessonId: seed.id });
    };

    const updateLesson = (sectionId, lessonId, patch) => {
        update(
            localSections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    lessons: (s.lessons || []).map((l) => {
                        if (l.id !== lessonId) return l;
                        const merged = { ...l, ...patch };
                        if (merged.type === 'text' && 'content' in patch) {
                            merged.word_count = countWords(merged.content);
                        }
                        return merged;
                    })
                };
            })
        );
    };

    const removeLesson = (sectionId, lessonId) => {
        update(
            localSections.map((s) =>
                s.id === sectionId
                    ? { ...s, lessons: (s.lessons || []).filter((l) => l.id !== lessonId) }
                    : s
            )
        );
        if (editing?.lessonId === lessonId) setEditing(null);
        if (preview?.lessonId === lessonId) setPreview(null);
    };

    // Derived data
    const filteredSections = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term && typeFilter === 'all') return localSections;
        return localSections
            .map((s) => {
                const lessons = (s.lessons || []).filter((l) => {
                    const typeOk =
                        typeFilter === 'all' ||
                        (typeFilter === 'article' && l.type === 'text') ||
                        l.type === typeFilter;
                    const titleOk = !term || (l.title || '').toLowerCase().includes(term);
                    return typeOk && titleOk;
                });
                return { ...s, lessons };
            })
            .filter((s) => (s.lessons || []).length > 0 || !term);
    }, [localSections, searchTerm, typeFilter]);

    const courseStats = useMemo(() => {
        const stats = { sections: localSections.length, article: 0, quiz: 0, assignment: 0, minutes: 0, issues: [] };
        localSections.forEach((s) => {
            (s.lessons || []).forEach((l) => {
                if (l.type === 'text') stats.article += 1;
                else if (l.type === 'quiz') stats.quiz += 1;
                else if (l.type === 'assignment') stats.assignment += 1;
                stats.minutes += estimateLessonMinutes(l);
                const lessonIssues = validateLesson(l);
                if (lessonIssues.length) {
                    stats.issues.push({ sectionId: s.id, lessonId: l.id, title: l.title, issues: lessonIssues });
                }
            });
        });
        return stats;
    }, [localSections]);

    const totalFilteredItems = filteredSections.reduce((sum, s) => sum + (s.lessons || []).length, 0);
    const totalItems = courseStats.article + courseStats.quiz + courseStats.assignment;
    const isFiltering = searchTerm.trim() || typeFilter !== 'all';

    const findLesson = (sectionId, lessonId) => {
        const section = localSections.find((s) => s.id === sectionId);
        const lesson = section?.lessons?.find((l) => l.id === lessonId);
        return { section, lesson };
    };

    const editingTarget = editing ? findLesson(editing.sectionId, editing.lessonId) : null;
    const previewTarget = preview ? findLesson(preview.sectionId, preview.lessonId) : null;

    return (
        <div className="space-y-6">
            {/* TOP TOOLBAR */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat label="Sections" value={courseStats.sections} />
                    <Stat label="Articles" value={courseStats.article} icon={FileText} />
                    <Stat label="Quizzes" value={courseStats.quiz} icon={HelpCircle} />
                    <Stat label="Assignments" value={courseStats.assignment} icon={ClipboardList} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by title..."
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'article', label: 'Articles' },
                            { key: 'quiz', label: 'Quizzes' },
                            { key: 'assignment', label: 'Assignments' }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setTypeFilter(f.key)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                    typeFilter === f.key
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setStudentView((v) => !v)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            studentView
                                ? 'bg-primary text-white border-primary'
                                : 'bg-card text-muted-foreground border-border hover:text-foreground'
                        }`}
                        title="Toggle student view"
                    >
                        {studentView ? <EyeOff size={14} /> : <Eye size={14} />}
                        {studentView ? 'Instructor view' : 'Student view'}
                    </button>

                    {courseStats.issues.length > 0 && !studentView && (
                        <button
                            onClick={() => setShowIssues((v) => !v)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 transition-all"
                        >
                            <AlertTriangle size={14} />
                            {courseStats.issues.length} issue{courseStats.issues.length === 1 ? '' : 's'}
                        </button>
                    )}
                </div>

                {isFiltering && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        <span>
                            Showing {totalFilteredItems} of {totalItems} items
                        </span>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setTypeFilter('all');
                            }}
                            className="font-semibold text-primary hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* ISSUES PANEL */}
            {showIssues && courseStats.issues.length > 0 && !studentView && (
                <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm text-amber-700 flex items-center gap-2">
                            <AlertTriangle size={16} /> Curriculum issues
                        </h3>
                        <button onClick={() => setShowIssues(false)} className="text-amber-700 hover:text-amber-900">
                            <X size={16} />
                        </button>
                    </div>
                    {courseStats.issues.map((it) => (
                        <div key={it.lessonId} className="text-xs bg-card border border-amber-500/20 rounded-lg p-3">
                            <div className="font-semibold text-foreground">{it.title || 'Untitled'}</div>
                            <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc list-inside">
                                {it.issues.map((i, idx) => (
                                    <li key={idx}>{i}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* SECTIONS */}
            {filteredSections.length === 0 && localSections.length > 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    No items match your search.
                </div>
            )}

            {filteredSections.map((section, index) => {
                const stats = sectionStats(section);
                const isOpen = expandedSections.has(section.id);
                return (
                    <div
                        key={section.id}
                        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden border-l-4 border-l-primary/40"
                    >
                        {/* Section Header */}
                        <div className="p-4 flex items-start justify-between gap-3 group">
                            <div className="flex items-start flex-1 gap-3 min-w-0">
                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm mt-0.5">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    {studentView ? (
                                        <h3 className="font-bold text-foreground text-lg">{section.title}</h3>
                                    ) : (
                                        <input
                                            type="text"
                                            value={section.title}
                                            placeholder="Enter Section Title"
                                            onChange={(e) => renameSection(section.id, e.target.value)}
                                            className="w-full bg-transparent font-bold text-lg text-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 rounded px-2 py-1 transition-all placeholder:text-muted-foreground/40"
                                        />
                                    )}
                                    <div className="px-2 text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span>
                                            {stats.article} article{stats.article === 1 ? '' : 's'}
                                        </span>
                                        <span>·</span>
                                        <span>
                                            {stats.quiz} quiz{stats.quiz === 1 ? '' : 'zes'}
                                        </span>
                                        <span>·</span>
                                        <span>
                                            {stats.assignment} assignment{stats.assignment === 1 ? '' : 's'}
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> ~{stats.minutes} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                                    aria-label={isOpen ? 'Collapse section' : 'Expand section'}
                                >
                                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {!studentView && (
                                    <button
                                        onClick={() => deleteSection(section.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                        aria-label="Delete section"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Items */}
                        {isOpen && (
                            <div className="px-4 pb-4 border-t border-border pt-4 space-y-2">
                                {(section.lessons || []).length === 0 && (
                                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                        No items in this section yet.
                                    </div>
                                )}

                                {(section.lessons || []).map((lesson) => (
                                    <LessonRow
                                        key={lesson.id}
                                        lesson={lesson}
                                        sectionId={section.id}
                                        studentView={studentView}
                                        courseId={courseId}
                                        onEdit={() => setEditing({ sectionId: section.id, lessonId: lesson.id })}
                                        onPreview={() => setPreview({ sectionId: section.id, lessonId: lesson.id })}
                                        onRemove={() => removeLesson(section.id, lesson.id)}
                                    />
                                ))}

                                {!studentView && (
                                    <div className="flex flex-wrap gap-2 pt-3">
                                        <AddButton
                                            type="text"
                                            label="Article"
                                            onClick={() => addLesson(section.id, 'text')}
                                        />
                                        <AddButton
                                            type="quiz"
                                            label="Quiz"
                                            onClick={() => addLesson(section.id, 'quiz')}
                                        />
                                        <AddButton
                                            type="assignment"
                                            label="Assignment"
                                            onClick={() => addLesson(section.id, 'assignment')}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {!studentView && (
                <button
                    onClick={addSection}
                    className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add New Section
                </button>
            )}

            {/* INLINE EDITOR DRAWER */}
            {editingTarget?.lesson && (
                <Drawer onClose={() => setEditing(null)} title={`Edit ${TYPE_META[editingTarget.lesson.type].label}`}>
                    <LessonEditor
                        lesson={editingTarget.lesson}
                        onChange={(patch) => updateLesson(editing.sectionId, editing.lessonId, patch)}
                    />
                </Drawer>
            )}

            {/* PREVIEW DRAWER */}
            {previewTarget?.lesson && (
                <Drawer onClose={() => setPreview(null)} title="Student preview" tone="muted">
                    <LessonPreview lesson={previewTarget.lesson} />
                </Drawer>
            )}
        </div>
    );
};

// ===== LESSON ROW =====

const LessonRow = ({ lesson, sectionId, studentView, courseId, onEdit, onPreview, onRemove }) => {
    const meta = TYPE_META[lesson.type] || TYPE_META.text;
    const Icon = meta.icon;
    const issues = validateLesson(lesson);
    const hasIssues = issues.length > 0;

    return (
        <div className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group">
            {!studentView && (
                <GripVertical className="text-muted-foreground/30 cursor-move mt-1 flex-shrink-0" size={18} />
            )}
            <div className={`p-2 ${meta.tint} rounded-lg flex-shrink-0`}>
                <Icon size={18} className={meta.color} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    {!studentView && hasIssues && (
                        <span
                            title={issues.join(' · ')}
                            className="flex-shrink-0 text-amber-600"
                        >
                            <AlertTriangle size={14} />
                        </span>
                    )}
                    <span className="font-semibold text-sm text-foreground truncate">
                        {lesson.title || <span className="italic text-muted-foreground">Untitled</span>}
                    </span>
                    {!studentView && lesson.published && (
                        <span
                            title="Published"
                            className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
                        />
                    )}
                </div>

                <LessonMeta lesson={lesson} />
            </div>

            {!studentView && (
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <RowAction icon={Eye} label="Preview" onClick={onPreview} />
                    <RowAction icon={Edit2} label="Edit" onClick={onEdit} />
                    {lesson.type === 'assignment' && courseId && (
                        <Link
                            to={`/instructor/students?course=${courseId}&assignment=${lesson.id}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                            title="View submissions"
                        >
                            <Users size={14} />
                        </Link>
                    )}
                    {courseId && (
                        <Link
                            to={`/instructor/students?course=${courseId}&item=${lesson.id}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                            title="Analytics"
                        >
                            <BarChart2 size={14} />
                        </Link>
                    )}
                    <RowAction icon={Trash2} label="Delete" onClick={onRemove} danger />
                </div>
            )}
        </div>
    );
};

const LessonMeta = ({ lesson }) => {
    if (lesson.type === 'text') {
        const words = lesson.word_count || countWords(lesson.content);
        const mins = readingMinutes(words);
        return (
            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>{mins} min read</span>
                {words > 0 && <><span>·</span><span>{words} words</span></>}
                <span>·</span>
                <span>{lesson.published ? 'Published' : 'Draft'}</span>
            </div>
        );
    }
    if (lesson.type === 'quiz') {
        const qCount = (lesson.questions || []).length;
        const attempts = lesson.attempts_allowed === 0 || !lesson.attempts_allowed
            ? 'Unlimited attempts'
            : `${lesson.attempts_allowed} attempt${lesson.attempts_allowed === 1 ? '' : 's'}`;
        return (
            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2">
                {qCount === 0 ? (
                    <span className="text-amber-600 font-medium">No questions added yet</span>
                ) : (
                    <>
                        <span>{qCount} question{qCount === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span>Pass ≥ {lesson.passing_score || 70}%</span>
                        <span>·</span>
                        <span>{attempts}</span>
                    </>
                )}
            </div>
        );
    }
    if (lesson.type === 'assignment') {
        const parts = [];
        if (lesson.due_date) parts.push(`Due ${formatDate(lesson.due_date)}`);
        if (lesson.total_marks) parts.push(`${lesson.total_marks} points`);
        if (lesson.submission_type) parts.push(SUBMISSION_LABELS[lesson.submission_type] || lesson.submission_type);
        return (
            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2">
                {parts.length === 0 ? (
                    <span className="italic">Add due date, points, and submission type</span>
                ) : (
                    parts.map((p, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <span>·</span>}
                            <span>{p}</span>
                        </React.Fragment>
                    ))
                )}
                {lesson.status && lesson.status !== 'open' && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        lesson.status === 'grading'
                            ? 'bg-amber-500/10 text-amber-700'
                            : 'bg-muted text-muted-foreground'
                    }`}>
                        {lesson.status}
                    </span>
                )}
            </div>
        );
    }
    return null;
};

const RowAction = ({ icon: Icon, label, onClick, danger }) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-1.5 rounded-md transition-colors ${
            danger
                ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
    >
        <Icon size={14} />
    </button>
);

const AddButton = ({ type, label, onClick }) => {
    const meta = TYPE_META[type] || TYPE_META.text;
    const Icon = meta.icon;
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground border border-border rounded-lg transition-all"
        >
            <Icon size={14} className={meta.color} />
            <Plus size={12} />
            {label}
        </button>
    );
};

const Stat = ({ label, value, icon: Icon }) => (
    <div className="bg-muted/50 rounded-xl p-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
        </div>
        <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
    </div>
);

// ===== DRAWER =====

const Drawer = ({ onClose, title, tone, children }) => (
    <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className={`relative ml-auto w-full max-w-xl h-full bg-card shadow-2xl overflow-y-auto animate-in slide-in-from-right ${tone === 'muted' ? 'bg-background' : ''}`}>
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-foreground">{title}</h3>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

// ===== EDITOR =====

const LessonEditor = ({ lesson, onChange }) => {
    return (
        <div className="space-y-5">
            <Field label="Title">
                <input
                    type="text"
                    value={lesson.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </Field>

            {lesson.type === 'text' && <ArticleEditor lesson={lesson} onChange={onChange} />}
            {lesson.type === 'quiz' && <QuizEditor lesson={lesson} onChange={onChange} />}
            {lesson.type === 'assignment' && <AssignmentEditor lesson={lesson} onChange={onChange} />}

            <div className="pt-4 border-t border-border">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!lesson.published}
                        onChange={(e) => onChange({ published: e.target.checked })}
                        className="rounded border-input"
                    />
                    <span className="font-medium text-foreground">Published</span>
                    <span className="text-muted-foreground text-xs">— visible to enrolled students</span>
                </label>
            </div>
        </div>
    );
};

const ArticleEditor = ({ lesson, onChange }) => (
    <Field label="Body" hint={`${countWords(lesson.content)} words · ~${readingMinutes(countWords(lesson.content))} min read`}>
        <textarea
            value={lesson.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={10}
            placeholder="Write your article content here..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
        />
    </Field>
);

const AssignmentEditor = ({ lesson, onChange }) => (
    <>
        <Field label="Instructions">
            <textarea
                value={lesson.instructions || ''}
                onChange={(e) => onChange({ instructions: e.target.value })}
                rows={6}
                placeholder="What should students do? Include rubric, requirements, examples..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
        </Field>
        <div className="grid grid-cols-2 gap-4">
            <Field label="Due date" icon={Calendar}>
                <input
                    type="date"
                    value={lesson.due_date || ''}
                    onChange={(e) => onChange({ due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </Field>
            <Field label="Total marks" icon={Award}>
                <input
                    type="number"
                    min="0"
                    value={lesson.total_marks || ''}
                    onChange={(e) => onChange({ total_marks: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </Field>
        </div>
        <Field label="Submission type">
            <div className="flex gap-2">
                {[
                    { key: 'file', label: 'File upload' },
                    { key: 'text', label: 'Text response' },
                    { key: 'url', label: 'URL submission' }
                ].map((opt) => (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => onChange({ submission_type: opt.key })}
                        className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            lesson.submission_type === opt.key
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </Field>
        <Field label="Status">
            <select
                value={lesson.status || 'open'}
                onChange={(e) => onChange({ status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
                <option value="open">Open</option>
                <option value="grading">Grading</option>
                <option value="closed">Closed</option>
            </select>
        </Field>
    </>
);

const QuizEditor = ({ lesson, onChange }) => {
    const questions = lesson.questions || [];

    const updateQuestion = (idx, patch) => {
        const next = questions.map((q, i) => (i === idx ? { ...q, ...patch } : q));
        onChange({ questions: next });
    };

    const removeQuestion = (idx) => {
        onChange({ questions: questions.filter((_, i) => i !== idx) });
    };

    const addQuestion = () => {
        onChange({
            questions: [
                ...questions,
                { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', points: 1 }
            ]
        });
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Passing score (%)">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={lesson.passing_score ?? 70}
                        onChange={(e) => onChange({ passing_score: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </Field>
                <Field label="Attempts allowed" hint="0 = unlimited">
                    <input
                        type="number"
                        min="0"
                        value={lesson.attempts_allowed ?? 0}
                        onChange={(e) => onChange({ attempts_allowed: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </Field>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">Questions ({questions.length})</h4>
                </div>

                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-muted/40 border border-border rounded-xl p-4 space-y-3 relative">
                        <button
                            onClick={() => removeQuestion(qIdx)}
                            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive rounded"
                            title="Remove question"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                Question {qIdx + 1}
                            </label>
                            <input
                                type="text"
                                value={q.question || ''}
                                onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                                placeholder="Enter the question..."
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                                const key = `option_${opt.toLowerCase()}`;
                                const isCorrect = (q.correct_answer || '').toUpperCase() === opt;
                                return (
                                    <div
                                        key={opt}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                            isCorrect
                                                ? 'bg-emerald-500/5 border-emerald-500/40'
                                                : 'bg-card border-border'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => updateQuestion(qIdx, { correct_answer: opt })}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                isCorrect
                                                    ? 'border-emerald-500 bg-emerald-500'
                                                    : 'border-muted-foreground/30'
                                            }`}
                                        >
                                            {isCorrect && <Check size={12} className="text-white" />}
                                        </button>
                                        <span className="text-xs font-bold text-muted-foreground">{opt}.</span>
                                        <input
                                            type="text"
                                            value={q[key] || ''}
                                            onChange={(e) => updateQuestion(qIdx, { [key]: e.target.value })}
                                            placeholder={`Option ${opt}`}
                                            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-3 border-2 border-dashed border-purple-500/30 text-purple-500 rounded-lg hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                >
                    <Plus size={16} /> Add question
                </button>
            </div>
        </>
    );
};

const Field = ({ label, hint, icon: Icon, children }) => (
    <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
            {hint && <span className="text-muted-foreground/70 normal-case font-normal">— {hint}</span>}
        </label>
        {children}
    </div>
);

// ===== PREVIEW =====

const LessonPreview = ({ lesson }) => {
    const meta = TYPE_META[lesson.type] || TYPE_META.text;
    const Icon = meta.icon;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon size={14} className={meta.color} />
                {meta.label} preview
            </div>
            <h2 className="text-2xl font-bold text-foreground">{lesson.title}</h2>

            {lesson.type === 'text' && (
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {lesson.content || <span className="italic text-muted-foreground">No content yet.</span>}
                </div>
            )}

            {lesson.type === 'quiz' && (
                <div className="space-y-5">
                    <div className="text-sm text-muted-foreground">
                        Pass ≥ {lesson.passing_score || 70}% ·{' '}
                        {lesson.attempts_allowed === 0 || !lesson.attempts_allowed
                            ? 'Unlimited attempts'
                            : `${lesson.attempts_allowed} attempt(s)`}
                    </div>
                    {(lesson.questions || []).length === 0 && (
                        <div className="text-sm italic text-muted-foreground">No questions yet.</div>
                    )}
                    {(lesson.questions || []).map((q, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl p-4 space-y-2">
                            <div className="font-semibold text-foreground">
                                {idx + 1}. {q.question || <span className="italic text-muted-foreground">No question</span>}
                            </div>
                            <div className="space-y-1.5 mt-2">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                    const text = q[`option_${opt.toLowerCase()}`];
                                    const correct = (q.correct_answer || '').toUpperCase() === opt;
                                    if (!text) return null;
                                    return (
                                        <div
                                            key={opt}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                                correct
                                                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                                                    : 'bg-muted/40 text-foreground'
                                            }`}
                                        >
                                            <span className="font-bold w-4">{opt}.</span>
                                            <span>{text}</span>
                                            {correct && (
                                                <Check size={14} className="ml-auto text-emerald-600" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lesson.type === 'assignment' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {lesson.due_date && (
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> Due {formatDate(lesson.due_date)}
                            </span>
                        )}
                        {lesson.total_marks && (
                            <span className="flex items-center gap-1">
                                <Award size={14} /> {lesson.total_marks} points
                            </span>
                        )}
                        {lesson.submission_type && (
                            <span className="flex items-center gap-1">
                                <Hash size={14} /> {SUBMISSION_LABELS[lesson.submission_type]}
                            </span>
                        )}
                    </div>
                    <div className="bg-muted/30 border border-border rounded-xl p-4">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Instructions</h4>
                        <div className="text-sm whitespace-pre-wrap text-foreground">
                            {lesson.instructions || <span className="italic text-muted-foreground">No instructions yet.</span>}
                        </div>
                    </div>
                    <div className="bg-card border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
                        <Layers size={20} className="mx-auto mb-2 opacity-50" />
                        Student submission widget ({SUBMISSION_LABELS[lesson.submission_type] || 'File upload'})
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumBuilder;

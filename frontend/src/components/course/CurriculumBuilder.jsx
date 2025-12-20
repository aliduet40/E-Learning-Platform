import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, FileText, Video, HelpCircle, ClipboardList, ChevronDown, ChevronUp, Check } from 'lucide-react';

const CurriculumBuilder = ({ sections = [], onChange }) => {
    const [localSections, setLocalSections] = useState(sections);
    const [expandedSection, setExpandedSection] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);

    const toggleSection = (id) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const addSection = () => {
        const newSection = { id: Date.now(), title: 'New Section', lessons: [] };
        const newSections = [...localSections, newSection];
        setLocalSections(newSections);
        setExpandedSection(newSection.id);
        if (onChange) onChange(newSections);
    };

    const deleteSection = (id) => {
        const newSections = localSections.filter(s => s.id !== id);
        setLocalSections(newSections);
        if (onChange) onChange(newSections);
    };

    const addLesson = (sectionId, type) => {
        const newSections = localSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    lessons: [...section.lessons, {
                        id: Date.now(),
                        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                        type,
                        questions: type === 'quiz' ? [] : undefined
                    }]
                };
            }
            return section;
        });
        setLocalSections(newSections);
        if (onChange) onChange(newSections);
    };

    const removeLesson = (sectionId, lessonId) => {
        const newSections = localSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    lessons: section.lessons.filter(l => l.id !== lessonId)
                };
            }
            return section;
        });
        setLocalSections(newSections);
        if (onChange) onChange(newSections);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={18} className="text-blue-500" />;
            case 'text': return <FileText size={18} className="text-gray-500" />;
            case 'quiz': return <HelpCircle size={18} className="text-purple-500" />;
            case 'assignment': return <ClipboardList size={18} className="text-orange-500" />;
            default: return <FileText size={18} />;
        }
    };

    return (
        <div className="space-y-6">
            {localSections.map((section, index) => (
                <div key={section.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                    {/* Section Header */}
                    <div className="bg-muted/50 p-4 flex items-center justify-between group">
                        <div className="flex items-center flex-1 gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm">
                                {index + 1}
                            </span>
                            <input
                                type="text"
                                value={section.title}
                                className="bg-transparent font-semibold text-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 rounded px-2 py-1 w-full max-w-md transition-all placeholder:text-muted-foreground/40"
                                placeholder="Enter Section Title"
                                onChange={(e) => {
                                    const newSections = [...localSections];
                                    newSections[index].title = e.target.value;
                                    setLocalSections(newSections);
                                    if (onChange) onChange(newSections);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                            >
                                {expandedSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button
                                onClick={() => deleteSection(section.id)}
                                className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Lessons List */}
                    {(expandedSection === section.id || true) && ( // Always open for now or logic to toggle
                        <div className={`p-4 bg-card border-t border-border ${expandedSection === section.id ? 'block' : 'hidden'}`}>
                            <div className="space-y-3 mb-6">
                                {section.lessons.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                                        No lessons in this section yet.
                                    </div>
                                )}
                                {section.lessons.map((lesson) => (
                                    <div key={lesson.id} className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition-all group">
                                            <GripVertical className="text-muted-foreground/40 cursor-move" size={20} />
                                            <div className="p-2 bg-muted rounded-md">
                                                {getIcon(lesson.type)}
                                            </div>
                                            <input
                                                value={lesson.title}
                                                className="flex-1 text-sm font-medium text-foreground bg-transparent focus:outline-none"
                                                onChange={(e) => {
                                                    const newSections = localSections.map(s => {
                                                        if (s.id === section.id) {
                                                            return {
                                                                ...s,
                                                                lessons: s.lessons.map(l => {
                                                                    if (l.id === lesson.id) {
                                                                        return { ...l, title: e.target.value };
                                                                    }
                                                                    return l;
                                                                })
                                                            };
                                                        }
                                                        return s;
                                                    });
                                                    setLocalSections(newSections);
                                                    if (onChange) onChange(newSections);
                                                }}
                                            />
                                            <div className="flex items-center gap-2">
                                                {lesson.type === 'quiz' && (
                                                    <button
                                                        onClick={() => setEditingQuiz({ sectionId: section.id, lessonId: lesson.id })}
                                                        className="flex items-center gap-2 px-2 py-1 text-xs font-bold bg-purple-500/10 text-purple-500 rounded hover:bg-purple-500/20 transition-colors"
                                                    >
                                                        Manage Quiz Questions
                                                        <ChevronDown size={12} />
                                                    </button>
                                                )}
                                                <span className="text-xs font-semibold px-2 py-1 bg-muted text-muted-foreground rounded uppercase tracking-wider text-[10px]">
                                                    {lesson.type}
                                                </span>
                                                <button
                                                    onClick={() => removeLesson(section.id, lesson.id)}
                                                    className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quiz Editor Inline */}
                                        {editingQuiz?.lessonId === lesson.id && (
                                            <div className="ml-8 p-6 bg-muted/30 border border-purple-500/20 rounded-xl space-y-6 animate-fade-in">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-bold text-purple-500 flex items-center gap-2">
                                                        <HelpCircle size={18} /> Quiz Designer
                                                    </h4>
                                                    <button
                                                        onClick={() => setEditingQuiz(null)}
                                                        className="text-xs font-bold text-muted-foreground hover:text-foreground"
                                                    >
                                                        Close Editor
                                                    </button>
                                                </div>

                                                <div className="space-y-8">
                                                    {(lesson.questions || []).map((q, qIdx) => (
                                                        <div key={qIdx} className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-4 relative group/q">
                                                            <button
                                                                onClick={() => {
                                                                    const newSections = localSections.map(s => {
                                                                        if (s.id === section.id) {
                                                                            return {
                                                                                ...s,
                                                                                lessons: s.lessons.map(l => {
                                                                                    if (l.id === lesson.id) {
                                                                                        const newQs = [...(l.questions || [])];
                                                                                        newQs.splice(qIdx, 1);
                                                                                        return { ...l, questions: newQs };
                                                                                    }
                                                                                    return l;
                                                                                })
                                                                            };
                                                                        }
                                                                        return s;
                                                                    });
                                                                    setLocalSections(newSections);
                                                                    if (onChange) onChange(newSections);
                                                                }}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover/q:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>

                                                            <div>
                                                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Question {qIdx + 1}</label>
                                                                <input
                                                                    type="text"
                                                                    value={q.question || ''}
                                                                    placeholder="e.g. What is React?"
                                                                    className="w-full bg-transparent border-b border-border py-2 focus:border-primary focus:outline-none transition-colors font-medium"
                                                                    onChange={(e) => {
                                                                        const newSections = localSections.map(s => {
                                                                            if (s.id === section.id) {
                                                                                return {
                                                                                    ...s,
                                                                                    lessons: s.lessons.map(l => {
                                                                                        if (l.id === lesson.id) {
                                                                                            const newQs = [...(l.questions || [])];
                                                                                            newQs[qIdx] = { ...newQs[qIdx], question: e.target.value };
                                                                                            return { ...l, questions: newQs };
                                                                                        }
                                                                                        return l;
                                                                                    })
                                                                                };
                                                                            }
                                                                            return s;
                                                                        });
                                                                        setLocalSections(newSections);
                                                                        if (onChange) onChange(newSections);
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {['a', 'b', 'c', 'd'].map(opt => (
                                                                    <div key={opt} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${q.correct_answer?.toLowerCase() === opt ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-muted/50 border-transparent'}`}>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newSections = localSections.map(s => {
                                                                                    if (s.id === section.id) {
                                                                                        return {
                                                                                            ...s,
                                                                                            lessons: s.lessons.map(l => {
                                                                                                if (l.id === lesson.id) {
                                                                                                    const newQs = [...(l.questions || [])];
                                                                                                    newQs[qIdx] = { ...newQs[qIdx], correct_answer: opt };
                                                                                                    return { ...l, questions: newQs };
                                                                                                }
                                                                                                return l;
                                                                                            })
                                                                                        };
                                                                                    }
                                                                                    return s;
                                                                                });
                                                                                setLocalSections(newSections);
                                                                                if (onChange) onChange(newSections);
                                                                            }}
                                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${q.correct_answer?.toLowerCase() === opt ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'}`}
                                                                        >
                                                                            {q.correct_answer?.toLowerCase() === opt && <Check size={12} className="text-white" />}
                                                                        </button>
                                                                        <span className="text-xs font-bold text-muted-foreground uppercase">{opt}.</span>
                                                                        <input
                                                                            type="text"
                                                                            value={q[`option_${opt}`] || ''}
                                                                            placeholder={`Option ${opt.toUpperCase()}`}
                                                                            className="flex-1 bg-transparent text-sm focus:outline-none"
                                                                            onChange={(e) => {
                                                                                const newSections = localSections.map(s => {
                                                                                    if (s.id === section.id) {
                                                                                        return {
                                                                                            ...s,
                                                                                            lessons: s.lessons.map(l => {
                                                                                                if (l.id === lesson.id) {
                                                                                                    const newQs = [...(l.questions || [])];
                                                                                                    newQs[qIdx] = { ...newQs[qIdx], [`option_${opt}`]: e.target.value };
                                                                                                    return { ...l, questions: newQs };
                                                                                                }
                                                                                                return l;
                                                                                            })
                                                                                        };
                                                                                    }
                                                                                    return s;
                                                                                });
                                                                                setLocalSections(newSections);
                                                                                if (onChange) onChange(newSections);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => {
                                                            const newSections = localSections.map(s => {
                                                                if (s.id === section.id) {
                                                                    return {
                                                                        ...s,
                                                                        lessons: s.lessons.map(l => {
                                                                            if (l.id === lesson.id) {
                                                                                const newQuestion = {
                                                                                    question: '',
                                                                                    option_a: '',
                                                                                    option_b: '',
                                                                                    option_c: '',
                                                                                    option_d: '',
                                                                                    correct_answer: 'a',
                                                                                    points: 1
                                                                                };
                                                                                return {
                                                                                    ...l,
                                                                                    questions: [...(l.questions || []), newQuestion]
                                                                                };
                                                                            }
                                                                            return l;
                                                                        })
                                                                    };
                                                                }
                                                                return s;
                                                            });
                                                            setLocalSections(newSections);
                                                            if (onChange) onChange(newSections);
                                                        }}
                                                        className="w-full py-3 border-2 border-dashed border-purple-500/20 text-purple-500 rounded-lg hover:bg-purple-500/5 transition-all flex items-center justify-center font-bold text-sm"
                                                    >
                                                        <Plus size={16} className="mr-2" /> Add Next Question
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add Lesson Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => addLesson(section.id, 'video')}
                                    className="flex items-center px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 hover:text-primary border border-border rounded-lg transition-all"
                                >
                                    <Video size={14} className="mr-2 text-blue-500" /> Video
                                </button>
                                <button
                                    onClick={() => addLesson(section.id, 'text')}
                                    className="flex items-center px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 hover:text-primary border border-border rounded-lg transition-all"
                                >
                                    <FileText size={14} className="mr-2 text-gray-500" /> Article
                                </button>
                                <button
                                    onClick={() => addLesson(section.id, 'quiz')}
                                    className="flex items-center px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 hover:text-primary border border-border rounded-lg transition-all"
                                >
                                    <HelpCircle size={14} className="mr-2 text-purple-500" /> Quiz
                                </button>
                                <button
                                    onClick={() => addLesson(section.id, 'assignment')}
                                    className="flex items-center px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted hover:bg-muted/80 hover:text-primary border border-border rounded-lg transition-all"
                                >
                                    <ClipboardList size={14} className="mr-2 text-orange-500" /> Assignment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button
                onClick={addSection}
                className="w-full py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} /> Add New Section
            </button>
        </div>
    );
};

export default CurriculumBuilder;
